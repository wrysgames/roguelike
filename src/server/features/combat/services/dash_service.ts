import { OnStart, Service } from '@flamework/core';
import { RunService } from '@rbxts/services';
import { CharacterService } from 'server/features/player/services/character_service';
import { PlayerService } from 'server/features/player/services/player_service';
import { CollisionService } from 'server/shared/services/collision_service';
import { ServerEvents } from 'server/signals/networking/events';
import { PlayerSignals } from 'server/signals/player_signal';
import {
	DASH_AIR_ANIMATION_ID,
	DASH_BACK_ANIMATION_ID,
	DASH_GROUND_ANIMATION_ID,
} from 'shared/constants/animations/dash';
import { CollisionGroup } from 'shared/constants/collision_group';
import { isCharacterModel } from 'shared/utils/character';
import { DashState } from '../utils/dash';
import { SharedStateManager } from '../utils/shared_state_manager';
import { CombatService } from './combat_service';

const DASH_COOLDOWN = 0.75;
const DASH_DURATION = 0.35; // seconds
const DASH_SPEED = 30;

@Service()
export class DashService implements OnStart {
	constructor(
		private collisionService: CollisionService,
		private characterService: CharacterService,
	) {}

	public onStart(): void {
		ServerEvents.combat.dash.connect((player) => {
			this.performDash(player);
		});
	}

	public performDash(player: Player): void {
		const state = this.getDashState(player);
		const attackState = SharedStateManager.getInstance().getAttackState(player);

		if (state.isDashing || state.isDashCooldownActive || attackState.isAttacking) return;

		const character = player.Character;
		if (!character) return;

		if (!isCharacterModel(character)) return;

		const humanoid = character.Humanoid;
		const humanoidRootPart = character.HumanoidRootPart;

		// set the character's collision group to Invincible
		this.collisionService.setModelCollisionGroup(character, CollisionGroup.Invincible);
		this.characterService.disableJump(character);

		const previousAutoRotate = humanoid.AutoRotate;
		humanoid.AutoRotate = false;

		state.isDashing = true;
		state.isDashCooldownActive = true;

		const isCharacterInAir = this.characterService.isInAir(character);
		const isDashingBackwards = this.characterService.isMovingBackwards(character);

		ServerEvents.vfx.spawnDashParticles.broadcast(
			humanoidRootPart,
			this.characterService.getMoveDirectionCFrame(character),
			isCharacterInAir,
		);

		// play the animation
		const dashAnimationId = isDashingBackwards
			? DASH_BACK_ANIMATION_ID
			: isCharacterInAir
				? DASH_AIR_ANIMATION_ID
				: DASH_GROUND_ANIMATION_ID;
		const animationTrack = this.characterService.loadAnimation(character, dashAnimationId);
		animationTrack.Play();

		let direction = humanoid.MoveDirection;
		if (direction.Magnitude === 0) direction = humanoidRootPart.CFrame.LookVector;

		const dashSpeedMultiplier = isCharacterInAir ? 2 : 1;
		const dashVelocity = direction.mul(DASH_SPEED * dashSpeedMultiplier);

		const velocity = isCharacterInAir ? new Vector3(dashVelocity.X, 0, dashVelocity.Z) : dashVelocity;
		const maxForce = isCharacterInAir ? new Vector3(1e5, 1e5, 1e5) : new Vector3(1e5, 0, 1e5);

		this.applyDashVelocity(
			humanoidRootPart,
			{
				velocity,
				maxForce,
				duration: math.min(DASH_DURATION, animationTrack.Length),
				shouldDecelerate: !isCharacterInAir,
			},
			() => {
				state.isDashing = false;
				this.characterService.enableJump(character);
				humanoid.AutoRotate = previousAutoRotate;
				this.collisionService.setModelCollisionGroup(character, CollisionGroup.Humanoid);
			},
		);

		task.delay(DASH_COOLDOWN, () => {
			state.isDashCooldownActive = false;
		});

		PlayerSignals.onPlayerDashed.Fire(player);
	}

	public getDashState(player: Player): DashState {
		return SharedStateManager.getInstance().getDashState(player);
	}

	private applyDashVelocity(
		part: BasePart,
		options: {
			velocity: Vector3;
			maxForce: Vector3;
			duration: number;
			shouldDecelerate: boolean;
		},
		onComplete: () => void,
	): void {
		const bodyVelocity = new Instance('BodyVelocity');
		bodyVelocity.Velocity = options.velocity;
		bodyVelocity.MaxForce = options.maxForce;
		bodyVelocity.Parent = part;

		task.delay(options.duration, () => {
			if (options.shouldDecelerate) {
				const decelTime = 0.15;
				const startVelocity = bodyVelocity.Velocity;
				let elapsed = 0;
				const connection = RunService.Heartbeat.Connect((dt) => {
					elapsed += dt;
					const alpha = math.clamp(elapsed / decelTime, 0, 1);
					bodyVelocity.Velocity = startVelocity.Lerp(new Vector3(0, startVelocity.Y, 0), alpha);
					if (alpha >= 1) {
						connection.Disconnect();
						bodyVelocity.Destroy();
						onComplete();
					}
				});
			} else {
				bodyVelocity.Destroy();
				onComplete();
			}
		});
	}
}

import { OnInit, OnStart, Service } from '@flamework/core';
import { PhysicsService } from '@rbxts/services';
import { CharacterService } from 'server/features/player/services/character_service';
import { CollisionGroup } from 'shared/constants/collision_group';
import { getDescendantsOfType } from 'shared/utils/instance';

@Service()
export class CollisionService implements OnInit, OnStart {
	constructor(private characterService: CharacterService) {}

	public onInit(): void | Promise<void> {
		PhysicsService.RegisterCollisionGroup(CollisionGroup.Humanoid);
		PhysicsService.RegisterCollisionGroup(CollisionGroup.Invincible);

		PhysicsService.CollisionGroupSetCollidable(CollisionGroup.Humanoid, CollisionGroup.Humanoid, true);
		PhysicsService.CollisionGroupSetCollidable(CollisionGroup.Humanoid, CollisionGroup.Invincible, false);
		PhysicsService.CollisionGroupSetCollidable(CollisionGroup.Invincible, CollisionGroup.Invincible, false);
	}

	public onStart(): void {
		this.characterService.addCharacterAddedCallback((character) => {
			this.setModelCollisionGroup(character, CollisionGroup.Humanoid);
		});
	}

	public setModelCollisionGroup(model: Instance, collisionGroup: CollisionGroup = CollisionGroup.Default): void {
		const descendants = getDescendantsOfType(model, 'BasePart');
		descendants.forEach((part) => (part.CollisionGroup = collisionGroup));
	}
}

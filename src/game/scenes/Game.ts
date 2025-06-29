import { type GameObjects, type Physics, Scene, Types } from "phaser";

export class Game extends Scene {
	background: Phaser.GameObjects.Image;
	player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

	constructor() {
		super("Game");
	}

	create(): void {
		let score: number = 0;
		let scoreText: GameObjects.Text;

		this.add.image(400, 300, "background");

		const platforms = this.physics.add.staticGroup();

		platforms.create(400, 568, "ground").setScale(2).refreshBody();

		platforms.create(600, 400, "ground");
		platforms.create(50, 250, "ground");
		platforms.create(750, 220, "ground");

		this.player = this.physics.add.sprite(100, 450, "dude");

		this.player.setBounce(0.2);
		this.player.setCollideWorldBounds(true);

		this.anims.create({
			key: "left",
			frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1,
		});

		this.anims.create({
			key: "turn",
			frames: [{ key: "dude", frame: 4 }],
			frameRate: 20,
		});

		this.anims.create({
			key: "right",
			frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
			frameRate: 10,
			repeat: -1,
		});

		this.player.body.setGravityY(50);
		this.physics.add.collider(this.player, platforms);

		const stars = this.physics.add.group({
			key: "star",
			repeat: 11,
			setXY: { x: 12, y: 0, stepX: 70 },
		});

		const collectStar: Types.Physics.Arcade.ArcadePhysicsCallback = (star) => {
			(star as Physics.Arcade.Sprite).disableBody(true, true);

			score += 10;
			scoreText.setText(`Score: ${score}`);

			if (stars.countActive(true) !== 0) return;

			stars.children.iterate((child) => {
				const starChild = child as Physics.Arcade.Sprite;

				starChild.enableBody(true, starChild.x, 0, true, true);

				return null;
			});

			const x =
				this.player.x < 400
					? Phaser.Math.Between(400, 800)
					: Phaser.Math.Between(0, 400);

			const bomb = bombs.create(x, 16, "bomb");
			bomb.setBounce(1);
			bomb.setCollideWorldBounds(true);
			bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
		};

		stars.children.iterate((child) => {
			(child as Physics.Arcade.Sprite).setBounceY(
				Phaser.Math.FloatBetween(0.4, 0.8),
			);

			return null;
		});

		this.physics.add.collider(stars, platforms);
		this.physics.add.overlap(this.player, stars, collectStar, undefined, this);

		scoreText = this.add.text(16, 16, "score: 0", {
			fontSize: "32px",
		});

		const bombs = this.physics.add.group();

		this.physics.add.collider(bombs, platforms);

		const hitBomb: Types.Physics.Arcade.ArcadePhysicsCallback = () => {
			this.physics.pause();

			this.player.setTint(0xff0000);

			this.player.anims.play("turn");
		};

		this.physics.add.collider(this.player, bombs, hitBomb, undefined, this);
	}

	update(): void {
		const cursors = this.input.keyboard?.createCursorKeys();

		if (cursors?.left.isDown) {
			this.player.setVelocityX(-160);

			this.player.anims.play("left", true);
		} else if (cursors?.right.isDown) {
			this.player.setVelocityX(160);

			this.player.anims.play("right", true);
		} else {
			this.player.setVelocityX(0);

			this.player.anims.play("turn");
		}

		if (cursors?.up.isDown && this.player.body.touching.down) {
			this.player.setVelocityY(-330);
		}
	}
}

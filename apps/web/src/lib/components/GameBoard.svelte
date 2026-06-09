<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { GameState, Team, Point } from '@canterball/shared';
	import { FIELD, PIECE, SHOT } from '@canterball/shared';
	import { CANVAS, fieldToCanvas, canvasToField } from '$lib/game/constants';

	let {
		state: gameState = null,
		mySide = null,
		isMyTurn = false,
		shotPath = [],
		shotAnimating = false,
		goalieWindowActive = false,
		onMovePiece = () => {},
		onDeclareShot = () => {},
		onRepositionGoalie = () => {},
	}: {
		state: GameState | null;
		mySide: Team | null;
		isMyTurn: boolean;
		shotPath: Point[];
		shotAnimating: boolean;
		goalieWindowActive: boolean;
		onMovePiece: (pieceId: string, x: number, y: number) => void;
		onDeclareShot: (pieceId: string, x: number, y: number, power: number) => void;
		onRepositionGoalie: (x: number, y: number) => void;
	} = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let animFrame: number | null = null;

	let fieldW: number;
	let fieldH: number;

	let selectedPiece = $state<string | null>(null);
	let moveTarget = $state<{ x: number; y: number } | null>(null);
	let shotTarget = $state<{ x: number; y: number } | null>(null);
	let shotPower = $state(5);

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		fieldW = CANVAS.WIDTH - CANVAS.PADDING * 2;
		fieldH = CANVAS.HEIGHT - CANVAS.PADDING * 2;
		animate();
	});

	onDestroy(() => {
		if (animFrame) cancelAnimationFrame(animFrame);
	});

	function animate() {
		draw();
		animFrame = requestAnimationFrame(animate);
	}

	function draw() {
		ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
		drawField();
		drawShotPath();
		drawPieces();
		drawBall();
		if (selectedPiece && moveTarget) {
			drawMovePreview();
		}
		if (shotTarget) {
			drawShotPreview();
		}
	}

	function drawField() {
		const { x: x0, y: y0 } = fieldToCanvas(0, 0);
		const { x: x1, y: y1 } = fieldToCanvas(FIELD.WIDTH, FIELD.HEIGHT);

		ctx.fillStyle = '#2d5a27';
		ctx.fillRect(x0, y0, x1 - x0, y1 - y0);

		ctx.strokeStyle = '#3a7a33';
		ctx.lineWidth = 1;
		ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);

		const { x: cx, y: cy } = fieldToCanvas(FIELD.CENTER_X, FIELD.CENTER_Y);
		ctx.beginPath();
		ctx.moveTo(cx, y0);
		ctx.lineTo(cx, y1);
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(cx, cy, (x1 - x0) * (FIELD.CENTER_RADIUS / FIELD.WIDTH), 0, Math.PI * 2);
		ctx.stroke();

		drawGoal(0);
		drawGoal(FIELD.WIDTH);
	}

	function drawGoal(fieldX: number) {
		const isHome = fieldX === 0;
		const { x: gx, y: gy } = fieldToCanvas(fieldX, FIELD.GOAL_Y);
		const { x: _, y: gy2 } = fieldToCanvas(fieldX, FIELD.GOAL_Y + FIELD.GOAL_HEIGHT);

		const depth = (CANVAS.WIDTH - CANVAS.PADDING * 2) * (FIELD.GOAL_DEPTH / FIELD.WIDTH);

		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 2;
		ctx.strokeRect(isHome ? gx - depth : gx, gy, depth, gy2 - gy);

		ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
		ctx.fillRect(isHome ? gx - depth : gx, gy, depth, gy2 - gy);
	}

	function drawPieces() {
		if (!gameState) return;
		for (const piece of gameState.pieces) {
			const { x, y } = fieldToCanvas(piece.x, piece.y);
			const radius =
				piece.type === 'GOALIE' ? PIECE.GOALIE_RADIUS * 4 : PIECE.PLAYER_RADIUS * 4;

			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);

			const isHome = piece.team === 'HOME';
			const isSelected = piece.id === selectedPiece;

			ctx.fillStyle = isHome
				? isSelected
					? '#4fc3f7'
					: '#2196f3'
				: isSelected
					? '#ff8a65'
					: '#ff5722';
			ctx.fill();

			if (isSelected) {
				ctx.strokeStyle = '#fff';
				ctx.lineWidth = 2;
				ctx.stroke();
			}

			ctx.fillStyle = '#fff';
			ctx.font = '8px monospace';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(piece.id.split('_')[1], x, y);
		}
	}

	function drawBall() {
		if (!gameState) return;
		const { x, y } = fieldToCanvas(gameState.ball.x, gameState.ball.y);

		ctx.beginPath();
		ctx.arc(x, y, 3, 0, Math.PI * 2);
		ctx.fillStyle = '#fff';
		ctx.fill();
		ctx.strokeStyle = '#ccc';
		ctx.lineWidth = 1;
		ctx.stroke();
	}

	function drawShotPath() {
		if (shotPath.length < 2) return;
		ctx.beginPath();
		for (let i = 0; i < shotPath.length; i++) {
			const { x, y } = fieldToCanvas(shotPath[i].x, shotPath[i].y);
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.strokeStyle = shotAnimating ? '#e94560' : 'rgba(233, 69, 96, 0.3)';
		ctx.lineWidth = 2;
		ctx.setLineDash([4, 4]);
		ctx.stroke();
		ctx.setLineDash([]);
	}

	function drawMovePreview() {
		if (!selectedPiece || !moveTarget) return;
		const piece = gameState?.pieces.find((p) => p.id === selectedPiece);
		if (!piece) return;

		const { x: fx, y: fy } = fieldToCanvas(piece.x, piece.y);
		const { x: tx, y: ty } = fieldToCanvas(moveTarget.x, moveTarget.y);

		ctx.beginPath();
		ctx.moveTo(fx, fy);
		ctx.lineTo(tx, ty);
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
		ctx.lineWidth = 1;
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(tx, ty, 5, 0, Math.PI * 2);
		ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
		ctx.fill();
	}

	function drawShotPreview() {
		if (!shotTarget) return;
		const { x: tx, y: ty } = fieldToCanvas(shotTarget.x, shotTarget.y);

		ctx.beginPath();
		ctx.arc(tx, ty, 6, 0, Math.PI * 2);
		ctx.strokeStyle = '#e94560';
		ctx.lineWidth = 2;
		ctx.stroke();

		ctx.fillStyle = '#e94560';
		ctx.font = '11px monospace';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'bottom';
		ctx.fillText(`power ${shotPower}`, tx, ty - 8);
	}

	function handleCanvasClick(e: MouseEvent) {
		if (!gameState || !mySide || !isMyTurn) return;
		if (shotAnimating) return;

		const rect = canvas.getBoundingClientRect();
		const scaleX = CANVAS.WIDTH / rect.width;
		const scaleY = CANVAS.HEIGHT / rect.height;
		const mx = (e.clientX - rect.left) * scaleX;
		const my = (e.clientY - rect.top) * scaleY;

		const field = canvasToField(mx, my);
		const clickPoint: Point = { x: field.x, y: field.y };

		if (goalieWindowActive) {
			onRepositionGoalie(clickPoint.x, clickPoint.y);
			return;
		}

		const clickedPiece = gameState.pieces.find((p) => {
			const { x: px, y: py } = fieldToCanvas(p.x, p.y);
			const dx = mx - px;
			const dy = my - py;
			const radius = p.type === 'GOALIE' ? PIECE.GOALIE_RADIUS * 5 : PIECE.PLAYER_RADIUS * 5;
			return dx * dx + dy * dy < radius * radius;
		});

		if (clickedPiece && clickedPiece.team === mySide) {
			selectedPiece = clickedPiece.id;
			moveTarget = null;
			shotTarget = null;
			return;
		}

		if (!selectedPiece) return;

		if (shotTarget) {
			onDeclareShot(selectedPiece, shotTarget.x, shotTarget.y, shotPower);
			shotTarget = null;
			selectedPiece = null;
			shotPower = 5;
			return;
		}

		moveTarget = clickPoint;
	}

	function handleCanvasRightClick(e: MouseEvent) {
		e.preventDefault();
		if (!gameState || !mySide || !isMyTurn || !selectedPiece) return;
		if (shotAnimating) return;

		const rect = canvas.getBoundingClientRect();
		const scaleX = CANVAS.WIDTH / rect.width;
		const scaleY = CANVAS.HEIGHT / rect.height;
		const mx = (e.clientX - rect.left) * scaleX;
		const my = (e.clientY - rect.top) * scaleY;

		const field = canvasToField(mx, my);
		shotTarget = { x: field.x, y: field.y };
	}

	function confirmMove() {
		if (!selectedPiece || !moveTarget) return;
		onMovePiece(selectedPiece, moveTarget.x, moveTarget.y);
		selectedPiece = null;
		moveTarget = null;
	}

	function cancelSelection() {
		selectedPiece = null;
		moveTarget = null;
		shotTarget = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			cancelSelection();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="board-container">
	<canvas
		bind:this={canvas}
		width={CANVAS.WIDTH}
		height={CANVAS.HEIGHT}
		onclick={handleCanvasClick}
		oncontextmenu={handleCanvasRightClick}
		class="board"
	></canvas>

	{#if selectedPiece}
		<div class="actions">
			{#if shotTarget}
				<div class="power-slider">
					<label for="shot-power">Power: {shotPower}</label>
					<input
						id="shot-power"
						type="range"
						min={SHOT.MIN_POWER}
						max={SHOT.MAX_POWER}
						bind:value={shotPower}
					/>
				</div>
				<button
					onclick={() => {
						const sel = selectedPiece;
						const st = shotTarget;
						if (sel && st) {
							onDeclareShot(sel, st.x, st.y, shotPower);
							selectedPiece = null;
							shotTarget = null;
						}
					}}
				>
					Shoot!
				</button>
			{:else if moveTarget}
				<button onclick={confirmMove}>Confirm Move</button>
			{/if}
			<button class="cancel" onclick={cancelSelection}>Cancel</button>
		</div>
	{/if}

	<div class="help">
		{#if goalieWindowActive}
			<strong>Move your goalie!</strong> Click on the field to reposition.
		{:else if !gameState}
			<span>Waiting for opponent...</span>
		{:else if isMyTurn && !selectedPiece}
			<span>Click a piece to select, then click to move. Right-click to aim a shot.</span>
		{:else if isMyTurn && selectedPiece}
			<span>Click on field to set move target, or right-click to aim a shot.</span>
		{:else}
			<span>Waiting for opponent's move...</span>
		{/if}
	</div>
</div>

<style>
	.board-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.8rem;
	}

	.board {
		border-radius: 8px;
		cursor: pointer;
		max-width: 100%;
		height: auto;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.power-slider {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		color: #e94560;
	}

	.power-slider input {
		width: 100px;
	}

	.cancel {
		background: transparent;
		border: 1px solid #555;
		color: #aaa;
		font-size: 0.85rem;
	}

	.help {
		font-size: 0.85rem;
		color: #888;
		text-align: center;
		min-height: 1.2rem;
	}

	.help strong {
		color: #ffd54f;
	}
</style>

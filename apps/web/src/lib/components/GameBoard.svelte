<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameState, Team, Point } from '@canterball/shared';
	import { FIELD, PIECE, SHOT } from '@canterball/shared';
	import { CANVAS, fieldToCanvas, canvasToField } from '$lib/game/constants';

	let {
		state: gameState = null,
		mySide = null,
		playerCount = 0,
		isMyTurn = false,
		onMovePiece = () => {}
	}: {
		state: GameState | null;
		mySide: Team | null;
		playerCount: number;
		isMyTurn: boolean;
		onMovePiece: (pieceId: string, x: number, y: number) => void;
	} = $props();

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let animFrame: number | null = null;

	let selectedPiece = $state<string | null>(null);
	let dragStart = $state<Point | null>(null);
	let dragCurrent = $state<Point | null>(null);

	// Camera / Viewport
	let camera = $state({ x: FIELD.CENTER_X, y: FIELD.CENTER_Y });
	const SCALE = 7; // Slightly higher zoom

	onMount(() => {
		ctx = canvas.getContext('2d')!;

		// Initial camera position
		if (gameState) {
			const focusPiece = gameState.pieces.find(p => p.id === `${mySide}_10`) || gameState.pieces[0];
			if (focusPiece) {
				camera.x = focusPiece.x;
				camera.y = focusPiece.y;
			}
		}

		animate();

		return () => {
			if (animFrame) cancelAnimationFrame(animFrame);
		};
	});

	function animate() {
		updateCamera();
		draw();
		animFrame = requestAnimationFrame(animate);
	}

	function updateCamera() {
		if (!gameState) return;

		let targetX = gameState.ball.x;
		let targetY = gameState.ball.y;

		// Priority: Selected piece > Ball
		if (selectedPiece) {
			const focusPiece = gameState.pieces.find(p => p.id === selectedPiece);
			if (focusPiece) {
				targetX = focusPiece.x;
				targetY = focusPiece.y;
			}
		}

		// Smoothly follow with a bit more speed
		camera.x += (targetX - camera.x) * 0.1;
		camera.y += (targetY - camera.y) * 0.1;

		// Optional: Clamp camera to field edges to avoid seeing too much "grass"
		const margin = 10;
		camera.x = Math.max(margin, Math.min(FIELD.WIDTH - margin, camera.x));
		camera.y = Math.max(margin, Math.min(FIELD.HEIGHT - margin, camera.y));
	}

	function worldToCanvas(x: number, y: number) {
		const cx = CANVAS.WIDTH / 2 + (x - camera.x) * SCALE;
		const cy = CANVAS.HEIGHT / 2 + (y - camera.y) * SCALE;
		return { x: cx, y: cy };
	}

	function canvasToWorld(mx: number, my: number) {
		const wx = (mx - CANVAS.WIDTH / 2) / SCALE + camera.x;
		const wy = (my - CANVAS.HEIGHT / 2) / SCALE + camera.y;
		return { x: wx, y: wy };
	}

	function draw() {
		ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
		drawField();
		drawPieces();
		drawBall();
		if (dragStart && dragCurrent) {
			drawDragPreview();
		}
	}

	function drawField() {
		const { x: x0, y: y0 } = worldToCanvas(0, 0);
		const { x: x1, y: y1 } = worldToCanvas(FIELD.WIDTH, FIELD.HEIGHT);

		ctx.fillStyle = '#1b3a18'; // Darker green for grass
		ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);

		ctx.fillStyle = '#2d5a27';
		ctx.fillRect(x0, y0, x1 - x0, y1 - y0);

		ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
		ctx.lineWidth = 2;
		ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);

		// Center line
		const { x: cx } = worldToCanvas(FIELD.CENTER_X, 0);
		ctx.beginPath();
		ctx.moveTo(cx, y0);
		ctx.lineTo(cx, y1);
		ctx.stroke();

		// Center circle
		const { x: ccx, y: ccy } = worldToCanvas(FIELD.CENTER_X, FIELD.CENTER_Y);
		ctx.beginPath();
		ctx.arc(ccx, ccy, FIELD.CENTER_RADIUS * SCALE, 0, Math.PI * 2);
		ctx.stroke();

		drawGoal(0);
		drawGoal(FIELD.WIDTH);
	}

	function drawGoal(fieldX: number) {
		const isHome = fieldX === 0;
		const { x: gx, y: gy } = worldToCanvas(fieldX, FIELD.GOAL_Y);
		const { x: _, y: gy2 } = worldToCanvas(fieldX, FIELD.GOAL_Y + FIELD.GOAL_HEIGHT);

		const depth = FIELD.GOAL_DEPTH * SCALE;

		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 3;
		ctx.strokeRect(isHome ? gx - depth : gx, gy, depth, gy2 - gy);

		ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
		ctx.fillRect(isHome ? gx - depth : gx, gy, depth, gy2 - gy);
	}

	function drawPieces() {
		if (!gameState) return;
		for (const piece of gameState.pieces) {
			const { x, y } = worldToCanvas(piece.x, piece.y);
			const radius = (piece.type === 'GOALIE' ? PIECE.GOALIE_RADIUS : PIECE.PLAYER_RADIUS) * SCALE;

			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);

			const isHome = piece.team === 'HOME';
			const isSelected = piece.id === selectedPiece;

			ctx.fillStyle = isHome
				? isSelected ? '#4fc3f7' : '#2196f3'
				: isSelected ? '#ff8a65' : '#ff5722';
			ctx.fill();

			if (isSelected) {
				ctx.strokeStyle = '#fff';
				ctx.lineWidth = 2;
				ctx.stroke();
			}

			ctx.fillStyle = '#fff';
			ctx.font = 'bold 10px sans-serif';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(piece.id.split('_')[1], x, y);
		}
	}

	function drawBall() {
		if (!gameState) return;
		const { x, y } = worldToCanvas(gameState.ball.x, gameState.ball.y);

		ctx.beginPath();
		ctx.arc(x, y, 0.8 * SCALE, 0, Math.PI * 2);
		ctx.fillStyle = '#fff';
		ctx.fill();
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 1;
		ctx.stroke();
	}

	function drawDragPreview() {
		if (!dragStart || !dragCurrent || !selectedPiece) return;
		const piece = gameState?.pieces.find((p) => p.id === selectedPiece);
		if (!piece) return;

		const { x: fx, y: fy } = worldToCanvas(dragStart.x, dragStart.y);

		const dx = dragCurrent.x - dragStart.x;
		const dy = dragCurrent.y - dragStart.y;
		const d = Math.sqrt(dx * dx + dy * dy);
		const maxDist = piece.type === 'GOALIE' ? PIECE.GOALIE_MOVE_RADIUS : PIECE.MOVE_RADIUS;
		const ratio = Math.min(maxDist / d, 1);

		const tx_field = dragStart.x + dx * ratio;
		const ty_field = dragStart.y + dy * ratio;
		const { x: tx, y: ty } = worldToCanvas(tx_field, ty_field);

		ctx.beginPath();
		ctx.moveTo(fx, fy);
		ctx.lineTo(tx, ty);
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
		ctx.setLineDash([5, 5]);
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.setLineDash([]);

		ctx.beginPath();
		ctx.arc(tx, ty, 4, 0, Math.PI * 2);
		ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
		ctx.fill();
	}

	function getCanvasCoords(e: PointerEvent | MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const scaleX = CANVAS.WIDTH / rect.width;
		const scaleY = CANVAS.HEIGHT / rect.height;
		return {
			mx: (e.clientX - rect.left) * scaleX,
			my: (e.clientY - rect.top) * scaleY
		};
	}

	function handlePointerDown(e: PointerEvent) {
		if (!gameState || !mySide || !isMyTurn) return;
		if (e.button !== 0) return;

		const { mx, my } = getCanvasCoords(e);
		const field = canvasToWorld(mx, my);

		const clickedPiece = gameState.pieces.find((p) => {
			const dx = field.x - p.x;
			const dy = field.y - p.y;
			const radius = p.type === 'GOALIE' ? PIECE.GOALIE_RADIUS * 1.5 : PIECE.PLAYER_RADIUS * 1.5;
			return dx * dx + dy * dy < radius * radius;
		});

		if (clickedPiece && clickedPiece.team === mySide) {
			selectedPiece = clickedPiece.id;
			dragStart = { x: clickedPiece.x, y: clickedPiece.y };
			dragCurrent = { x: clickedPiece.x, y: clickedPiece.y };
			canvas.setPointerCapture(e.pointerId);
		} else {
			selectedPiece = null;
			dragStart = null;
			dragCurrent = null;
		}
	}

	function handlePointerMove(e: PointerEvent) {
		if (!dragStart) return;
		const { mx, my } = getCanvasCoords(e);
		dragCurrent = canvasToWorld(mx, my);
	}

	function handlePointerUp(e: PointerEvent) {
		if (!dragStart || !selectedPiece || !dragCurrent) {
			dragStart = null;
			dragCurrent = null;
			return;
		}

		const dx = dragCurrent.x - dragStart.x;
		const dy = dragCurrent.y - dragStart.y;
		const d = Math.sqrt(dx * dx + dy * dy);

		if (d > 0.5) {
			const piece = gameState?.pieces.find(p => p.id === selectedPiece);
			const maxDist = piece?.type === 'GOALIE' ? PIECE.GOALIE_MOVE_RADIUS : PIECE.MOVE_RADIUS;

			const ratio = Math.min(maxDist / d, 1);
			const targetX = dragStart.x + dx * ratio;
			const targetY = dragStart.y + dy * ratio;

			onMovePiece(selectedPiece, targetX, targetY);
		}

		dragStart = null;
		dragCurrent = null;
		selectedPiece = null;
	}

	function cancelSelection() {
		selectedPiece = null;
		dragStart = null;
		dragCurrent = null;
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
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		oncontextmenu={(e) => e.preventDefault()}
		class="board"
	></canvas>

	<div class="help">
		{#if !gameState}
			<span>Waiting for opponent ({playerCount}/2)...</span>
		{:else if isMyTurn}
			{#if !gameState.kickoffDone}
				<strong>Kickoff!</strong> Hit the ball towards your side.
			{:else}
				<span>Click and drag a piece to hit the ball.</span>
			{/if}
		{:else}
			<span>Waiting for opponent...</span>
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
		cursor: crosshair;
		max-width: 100%;
		height: auto;
		touch-action: none;
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

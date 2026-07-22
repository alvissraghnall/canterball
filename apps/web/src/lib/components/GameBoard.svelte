<script lang="ts">
	import { onMount } from 'svelte';
	import type { GameState, Team, Point } from '@canterball/shared';
	import { FIELD, PIECE } from '@canterball/shared';
	import { CANVAS } from '$lib/game/constants';

	// ─── Constants ───────────────────────────────────────────────────────────────

	const MIN_DRAG_THRESHOLD = 0.5;
	const BALL_RADIUS = 0.8;
	const PAD = 20; // px padding around field

	// ─── Derived scale: fit field into canvas with padding ───────────────────────

	const SCALE_X = (CANVAS.WIDTH - PAD * 2) / FIELD.WIDTH;   // ~7.6
	const SCALE_Y = (CANVAS.HEIGHT - PAD * 2) / FIELD.HEIGHT; // ~7.3

	function fieldToCanvas(fx: number, fy: number): Point {
		return {
			x: PAD + fx * SCALE_X,
			y: PAD + fy * SCALE_Y,
		};
	}

	function canvasToField(cx: number, cy: number): Point {
		return {
			x: (cx - PAD) / SCALE_X,
			y: (cy - PAD) / SCALE_Y,
		};
	}

	// For radius values we use the average scale so circles don't look oval
	const SCALE_R = (SCALE_X + SCALE_Y) / 2;

	// ─── Props ───────────────────────────────────────────────────────────────────

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

	// ─── Canvas & State ──────────────────────────────────────────────────────────

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let animFrame: number | null = null;

	let selectedPiece = $state<string | null>(null);
	let dragStart = $state<Point | null>(null);
	let dragCurrent = $state<Point | null>(null);
	let hoveredPiece = $state<string | null>(null);

	// ─── Lifecycle ───────────────────────────────────────────────────────────────

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		if (animFrame) cancelAnimationFrame(animFrame);
		animate();
		return () => {
			if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
		};
	});

	// ─── Game Loop ───────────────────────────────────────────────────────────────

	function animate() {
		draw();
		animFrame = requestAnimationFrame(animate);
	}

	// ─── Shared Move Math (mirrors server logic) ─────────────────────────────────

	function clampToMoveRadius(
		originX: number, originY: number,
		targetX: number, targetY: number,
		maxDist: number
	): Point {
		const dx = targetX - originX;
		const dy = targetY - originY;
		const d = Math.sqrt(dx * dx + dy * dy);
		const ratio = Math.min(maxDist / d, 1);
		return { x: originX + dx * ratio, y: originY + dy * ratio };
	}

	function getPieceMoveRadius(type: string): number {
		return type === 'GOALIE' ? PIECE.GOALIE_MOVE_RADIUS : PIECE.MOVE_RADIUS;
	}

	// ─── Draw ────────────────────────────────────────────────────────────────────

	function draw() {
		ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
		drawField();
		if (selectedPiece) drawMoveRadius();
		drawPieces();
		drawBall();
		if (dragStart && dragCurrent) drawDragPreview();
		if (selectedPiece && dragCurrent) drawBallTrajectoryPreview();
	}

	// ── Field ─────────────────────────────────────────────────────────────────

	function drawField() {
		const { x: x0, y: y0 } = fieldToCanvas(0, 0);
		const { x: x1, y: y1 } = fieldToCanvas(FIELD.WIDTH, FIELD.HEIGHT);
		const fw = x1 - x0;
		const fh = y1 - y0;

		// Background outside field
		ctx.fillStyle = '#1b3a18';
		ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);

		// Alternating grass stripes
		const STRIPE_COUNT = 10;
		const stripeW = fw / STRIPE_COUNT;
		for (let i = 0; i < STRIPE_COUNT; i++) {
			ctx.fillStyle = i % 2 === 0 ? '#2d5a27' : '#265122';
			ctx.fillRect(x0 + i * stripeW, y0, stripeW, fh);
		}

		// Field border
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
		ctx.lineWidth = 2;
		ctx.strokeRect(x0, y0, fw, fh);

		// Center line
		const { x: clx } = fieldToCanvas(FIELD.CENTER_X, 0);
		const { y: cly0 } = fieldToCanvas(0, 0);
		const { y: cly1 } = fieldToCanvas(0, FIELD.HEIGHT);
		ctx.beginPath();
		ctx.moveTo(clx, cly0);
		ctx.lineTo(clx, cly1);
		ctx.strokeStyle = 'rgba(255,255,255,0.35)';
		ctx.lineWidth = 1.5;
		ctx.stroke();

		// Center circle
		const { x: ccx, y: ccy } = fieldToCanvas(FIELD.CENTER_X, FIELD.CENTER_Y);
		ctx.beginPath();
		ctx.arc(ccx, ccy, FIELD.CENTER_RADIUS * SCALE_R, 0, Math.PI * 2);
		ctx.strokeStyle = 'rgba(255,255,255,0.35)';
		ctx.lineWidth = 1.5;
		ctx.stroke();

		// Center dot
		ctx.beginPath();
		ctx.arc(ccx, ccy, 3, 0, Math.PI * 2);
		ctx.fillStyle = 'rgba(255,255,255,0.4)';
		ctx.fill();

		drawGoal(0);
		drawGoal(FIELD.WIDTH);
	}

	function drawGoal(fieldX: number) {
		const isHome = fieldX === 0;
		const { x: gx, y: gy  } = fieldToCanvas(fieldX, FIELD.GOAL_Y);
		const { y: gy2 } = fieldToCanvas(fieldX, FIELD.GOAL_Y + FIELD.GOAL_HEIGHT);
		const depth = FIELD.GOAL_DEPTH * SCALE_X;
		const gh = gy2 - gy;

		const rx = isHome ? gx - depth : gx;

		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 3;
		ctx.strokeRect(rx, gy, depth, gh);

		ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
		ctx.fillRect(rx, gy, depth, gh);

		// Net grid
		ctx.strokeStyle = 'rgba(255,255,255,0.12)';
		ctx.lineWidth = 0.5;
		for (let nx = rx; nx < rx + depth; nx += depth / 3) {
			ctx.beginPath(); ctx.moveTo(nx, gy); ctx.lineTo(nx, gy2); ctx.stroke();
		}
		for (let ny = gy; ny < gy2; ny += gh / 4) {
			ctx.beginPath(); ctx.moveTo(rx, ny); ctx.lineTo(rx + depth, ny); ctx.stroke();
		}
	}

	// ── Move Radius ───────────────────────────────────────────────────────────

	function drawMoveRadius() {
		if (!selectedPiece || !gameState) return;
		const piece = gameState.pieces.find((p) => p.id === selectedPiece);
		if (!piece) return;

		const { x, y } = fieldToCanvas(piece.x, piece.y);
		const maxDist = getPieceMoveRadius(piece.type);

		ctx.save();
		ctx.beginPath();
		ctx.arc(x, y, maxDist * SCALE_R, 0, Math.PI * 2);
		ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
		ctx.fill();
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
		ctx.setLineDash([4, 4]);
		ctx.lineWidth = 1.5;
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.restore();
	}

	// ── Pieces ────────────────────────────────────────────────────────────────

	function drawPieces() {
		if (!gameState) return;

		for (const piece of gameState.pieces) {
			const { x, y } = fieldToCanvas(piece.x, piece.y);
			const isGoalie = piece.type === 'GOALIE';
			const radius = (isGoalie ? PIECE.GOALIE_RADIUS : PIECE.PLAYER_RADIUS) * SCALE_R;
			const isHome = piece.team === 'HOME';
			const isSelected = piece.id === selectedPiece;
			const isHovered = piece.id === hoveredPiece && !isSelected;
			const isMyPiece = piece.team === mySide;

			ctx.save();
			ctx.shadowColor = 'rgba(0,0,0,0.5)';
			ctx.shadowBlur = 6;
			ctx.shadowOffsetY = 3;

			const grad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
			if (isHome) {
				grad.addColorStop(0, isSelected ? '#80d8ff' : isHovered ? '#4fc3f7' : '#2196f3');
				grad.addColorStop(1, isSelected ? '#0277bd' : '#01579b');
			} else {
				grad.addColorStop(0, isSelected ? '#ffccbc' : isHovered ? '#ff8a65' : '#ff5722');
				grad.addColorStop(1, isSelected ? '#bf360c' : '#7f0000');
			}

			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fillStyle = grad;
			ctx.fill();
			ctx.restore();

			if (isGoalie) {
				ctx.beginPath();
				ctx.arc(x, y, radius, 0, Math.PI * 2);
				ctx.strokeStyle = isHome ? '#ffd54f' : '#b2ff59';
				ctx.lineWidth = 2;
				ctx.stroke();
			}

			if (isSelected) {
				ctx.beginPath();
				ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
				ctx.strokeStyle = '#fff';
				ctx.lineWidth = 2;
				ctx.stroke();
			}

			if (isHovered && isMyPiece && isMyTurn) {
				ctx.beginPath();
				ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
				ctx.strokeStyle = 'rgba(255,255,255,0.5)';
				ctx.lineWidth = 1.5;
				ctx.stroke();
			}

			ctx.fillStyle = '#fff';
			ctx.font = `bold ${Math.max(8, radius * 0.85)}px sans-serif`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(piece.id.split('_')[1], x, y);
		}
	}

	// ── Ball ──────────────────────────────────────────────────────────────────

	function drawBall() {
		if (!gameState) return;
		const { x, y } = fieldToCanvas(gameState.ball.x, gameState.ball.y);
		const r = BALL_RADIUS * SCALE_R;

		ctx.save();
		ctx.shadowColor = 'rgba(0,0,0,0.6)';
		ctx.shadowBlur = 8;
		ctx.shadowOffsetY = 4;

		const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, 0, x, y, r);
		grad.addColorStop(0, '#ffffff');
		grad.addColorStop(0.6, '#dddddd');
		grad.addColorStop(1, '#aaaaaa');

		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.fillStyle = grad;
		ctx.fill();
		ctx.restore();

		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2);
		ctx.strokeStyle = 'rgba(0,0,0,0.3)';
		ctx.lineWidth = 0.8;
		ctx.stroke();
	}

	// ── Drag Preview ──────────────────────────────────────────────────────────

	function drawDragPreview() {
		if (!dragStart || !dragCurrent || !selectedPiece || !gameState) return;
		const piece = gameState.pieces.find((p) => p.id === selectedPiece);
		if (!piece) return;

		const maxDist = getPieceMoveRadius(piece.type);
		const target = clampToMoveRadius(dragStart.x, dragStart.y, dragCurrent.x, dragCurrent.y, maxDist);

		const { x: fx, y: fy } = fieldToCanvas(dragStart.x, dragStart.y);
		const { x: tx, y: ty } = fieldToCanvas(target.x, target.y);

		ctx.beginPath();
		ctx.moveTo(fx, fy);
		ctx.lineTo(tx, ty);
		ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
		ctx.setLineDash([5, 5]);
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.setLineDash([]);

		ctx.beginPath();
		ctx.arc(tx, ty, 5, 0, Math.PI * 2);
		ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
		ctx.fill();
		ctx.strokeStyle = 'rgba(0,0,0,0.3)';
		ctx.lineWidth = 1;
		ctx.stroke();
	}

	// ── Ball Trajectory Preview ───────────────────────────────────────────────

	function drawBallTrajectoryPreview() {
		if (!dragStart || !dragCurrent || !selectedPiece || !gameState) return;

		const piece = gameState.pieces.find((p) => p.id === selectedPiece);
		if (!piece) return;

		const dx = dragCurrent.x - dragStart.x;
		const dy = dragCurrent.y - dragStart.y;
		const d = Math.sqrt(dx * dx + dy * dy);
		if (d < MIN_DRAG_THRESHOLD) return;

		const dirX = dx / d;
		const dirY = dy / d;

		const maxDist = getPieceMoveRadius(piece.type);
		const target = clampToMoveRadius(dragStart.x, dragStart.y, dragCurrent.x, dragCurrent.y, maxDist);
		const ballDx = gameState.ball.x - target.x;
		const ballDy = gameState.ball.y - target.y;
		const ballDist = Math.sqrt(ballDx * ballDx + ballDy * ballDy);
		const contactRadius = (piece.type === 'GOALIE' ? PIECE.GOALIE_RADIUS : PIECE.PLAYER_RADIUS) + BALL_RADIUS;
		if (ballDist > contactRadius * 2.5) return;

		const STEPS = 20;
		const STEP_LEN = 2;
		let bx = gameState.ball.x;
		let by = gameState.ball.y;

		ctx.save();
		ctx.setLineDash([3, 5]);
		ctx.strokeStyle = 'rgba(255, 220, 80, 0.5)';
		ctx.lineWidth = 1.5;
		ctx.beginPath();

		const { x: startX, y: startY } = fieldToCanvas(bx, by);
		ctx.moveTo(startX, startY);

		for (let i = 0; i < STEPS; i++) {
			bx += dirX * STEP_LEN;
			by += dirY * STEP_LEN;
			if (bx < 0 || bx > FIELD.WIDTH || by < 0 || by > FIELD.HEIGHT) break;
			const { x, y } = fieldToCanvas(bx, by);
			ctx.lineTo(x, y);
		}

		ctx.stroke();
		ctx.setLineDash([]);

		const { x: ex, y: ey } = fieldToCanvas(bx, by);
		drawArrow(ex, ey, dirX * SCALE_X, dirY * SCALE_Y);
		ctx.restore();
	}

	function drawArrow(x: number, y: number, dirX: number, dirY: number) {
		const size = 6;
		const angle = Math.atan2(dirY, dirX);
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(angle);
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(-size, -size / 2);
		ctx.lineTo(-size, size / 2);
		ctx.closePath();
		ctx.fillStyle = 'rgba(255, 220, 80, 0.7)';
		ctx.fill();
		ctx.restore();
	}

	// ─── Input ───────────────────────────────────────────────────────────────────

	function getCanvasCoords(e: PointerEvent | MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		const scaleX = CANVAS.WIDTH / rect.width;
		const scaleY = CANVAS.HEIGHT / rect.height;
		return {
			mx: (e.clientX - rect.left) * scaleX,
			my: (e.clientY - rect.top) * scaleY
		};
	}

	function getPieceAtPoint(fieldX: number, fieldY: number) {
		if (!gameState) return null;
		return gameState.pieces.find((p) => {
			const dx = fieldX - p.x;
			const dy = fieldY - p.y;
			const r = (p.type === 'GOALIE' ? PIECE.GOALIE_RADIUS * 1.5 : PIECE.PLAYER_RADIUS * 1.5);
			return dx * dx + dy * dy < r * r;
		}) ?? null;
	}

	function handlePointerDown(e: PointerEvent) {
		if (!gameState || !mySide || !isMyTurn) return;
		if (e.button !== 0) return;
		if (e.pointerType === 'touch' && !e.isPrimary) return;

		const { mx, my } = getCanvasCoords(e);
		const field = canvasToField(mx, my);
		const clickedPiece = getPieceAtPoint(field.x, field.y);

		if (clickedPiece && clickedPiece.team === mySide) {
			selectedPiece = clickedPiece.id;
			dragStart = { x: clickedPiece.x, y: clickedPiece.y };
			dragCurrent = { x: clickedPiece.x, y: clickedPiece.y };
			canvas.setPointerCapture(e.pointerId);
		} else {
			cancelSelection();
		}
	}

	function handlePointerMove(e: PointerEvent) {
		if (e.pointerType === 'touch' && !e.isPrimary) return;

		const { mx, my } = getCanvasCoords(e);
		const field = canvasToField(mx, my);

		if (dragStart) {
			dragCurrent = field;
		} else {
			const piece = getPieceAtPoint(field.x, field.y);
			const isSelectable = piece && piece.team === mySide && isMyTurn;
			hoveredPiece = isSelectable ? piece!.id : null;
			canvas.style.cursor = isSelectable ? 'pointer' : 'crosshair';
		}
	}

	function handlePointerUp(e: PointerEvent) {
		if (e.pointerType === 'touch' && !e.isPrimary) return;

		if (!dragStart || !selectedPiece || !dragCurrent) {
			dragStart = null;
			dragCurrent = null;
			return;
		}

		const dx = dragCurrent.x - dragStart.x;
		const dy = dragCurrent.y - dragStart.y;
		const d = Math.sqrt(dx * dx + dy * dy);

		if (d > MIN_DRAG_THRESHOLD) {
			const piece = gameState?.pieces.find((p) => p.id === selectedPiece);
			const maxDist = piece ? getPieceMoveRadius(piece.type) : PIECE.MOVE_RADIUS;
			const target = clampToMoveRadius(dragStart.x, dragStart.y, dragCurrent.x, dragCurrent.y, maxDist);
			onMovePiece(selectedPiece, target.x, target.y);
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
		if (e.key === 'Escape') cancelSelection();
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
			<span>Waiting for opponent ({playerCount}/2)…</span>
		{:else if isMyTurn}
			{#if !gameState.kickoffDone}
				<strong>Kickoff!</strong> Hit the ball towards your side.
			{:else}
				<span>Click and drag a piece to move it.</span>
			{/if}
		{:else}
			<span>Opponent is thinking…</span>
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
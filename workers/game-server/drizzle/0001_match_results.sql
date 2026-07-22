CREATE TABLE `match_results` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`home_player_id` text NOT NULL,
	`away_player_id` text NOT NULL,
	`home_player_name` text NOT NULL,
	`away_player_name` text NOT NULL,
	`winner` text NOT NULL,
	`home_score` integer NOT NULL,
	`away_score` integer NOT NULL,
	`created_at` text NOT NULL
);

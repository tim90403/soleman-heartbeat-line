<?php
/**
 * Plugin Name: Soleman Heartbeat Line
 * Description: 在 Elementor 加入 soleman heartbeat line widget，於版面任意位置顯示由左至右循環的心電圖軌跡。
 * Version: 1.0.2
 * Author: Soleman
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Text Domain: soleman-heartbeat-line
 * Elementor tested up to: 4.3.5
 *
 * @package SolemanHeartbeatLine
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SOLEMAN_HEARTBEAT_LINE_VERSION', '1.0.2' );
define( 'SOLEMAN_HEARTBEAT_LINE_FILE', __FILE__ );
define( 'SOLEMAN_HEARTBEAT_LINE_PATH', plugin_dir_path( __FILE__ ) );
define( 'SOLEMAN_HEARTBEAT_LINE_URL', plugin_dir_url( __FILE__ ) );
define( 'SOLEMAN_HEARTBEAT_LINE_MINIMUM_ELEMENTOR', '3.5.0' );

/**
 * Boot after Elementor is available, regardless of plugin load order.
 */
function soleman_heartbeat_line_boot() {
	if ( did_action( 'elementor/loaded' ) ) {
		soleman_heartbeat_line_init();
		return;
	}

	add_action( 'elementor/loaded', 'soleman_heartbeat_line_init' );
	add_action( 'admin_init', 'soleman_heartbeat_line_maybe_notice_missing' );
}
add_action( 'plugins_loaded', 'soleman_heartbeat_line_boot' );

/**
 * Register the widget once Elementor has loaded.
 */
function soleman_heartbeat_line_init() {
	if ( ! defined( 'ELEMENTOR_VERSION' ) || ! version_compare( ELEMENTOR_VERSION, SOLEMAN_HEARTBEAT_LINE_MINIMUM_ELEMENTOR, '>=' ) ) {
		add_action( 'admin_notices', 'soleman_heartbeat_line_notice_version' );
		return;
	}

	add_action( 'elementor/elements/categories_registered', 'soleman_heartbeat_line_register_category' );
	add_action( 'elementor/widgets/register', 'soleman_heartbeat_line_register_widget' );
	add_action( 'elementor/frontend/after_register_scripts', 'soleman_heartbeat_line_register_assets' );
}

/**
 * Show a notice when Elementor is not active.
 */
function soleman_heartbeat_line_maybe_notice_missing() {
	if ( did_action( 'elementor/loaded' ) ) {
		return;
	}

	add_action( 'admin_notices', 'soleman_heartbeat_line_notice_missing' );
}

/**
 * Admin notice: Elementor is missing.
 */
function soleman_heartbeat_line_notice_missing() {
	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	echo '<div class="notice notice-warning"><p>' . esc_html__( 'Soleman Heartbeat Line 需要先安裝並啟用 Elementor。', 'soleman-heartbeat-line' ) . '</p></div>';
}

/**
 * Admin notice: Elementor is too old.
 */
function soleman_heartbeat_line_notice_version() {
	if ( ! current_user_can( 'activate_plugins' ) ) {
		return;
	}

	echo '<div class="notice notice-warning"><p>' . esc_html(
		sprintf(
			/* translators: %s: minimum Elementor version */
			__( 'Soleman Heartbeat Line 需要 Elementor %s 或更新版本。', 'soleman-heartbeat-line' ),
			SOLEMAN_HEARTBEAT_LINE_MINIMUM_ELEMENTOR
		)
	) . '</p></div>';
}

/**
 * Add the Soleman category to the Elementor panel.
 *
 * @param \Elementor\Elements_Manager $elements_manager Elements manager.
 */
function soleman_heartbeat_line_register_category( $elements_manager ) {
	$elements_manager->add_category(
		'soleman',
		array(
			'title' => esc_html__( 'Soleman', 'soleman-heartbeat-line' ),
			'icon'  => 'eicon-animation',
		)
	);
}

/**
 * Register frontend assets. Elementor enqueues them through the widget dependencies.
 */
function soleman_heartbeat_line_register_assets() {
	wp_register_style(
		'soleman-heartbeat-line',
		SOLEMAN_HEARTBEAT_LINE_URL . 'assets/css/heartbeat.css',
		array(),
		SOLEMAN_HEARTBEAT_LINE_VERSION
	);

	wp_register_script(
		'soleman-heartbeat-line',
		SOLEMAN_HEARTBEAT_LINE_URL . 'assets/js/heartbeat.js',
		array( 'elementor-frontend' ),
		SOLEMAN_HEARTBEAT_LINE_VERSION,
		true
	);
}

/**
 * Register the Elementor widget.
 *
 * @param \Elementor\Widgets_Manager $widgets_manager Widgets manager.
 */
function soleman_heartbeat_line_register_widget( $widgets_manager ) {
	require_once SOLEMAN_HEARTBEAT_LINE_PATH . 'includes/class-widget.php';

	$widgets_manager->register( new \SolemanHeartbeatLine\Widget() );
}

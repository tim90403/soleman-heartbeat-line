<?php
/**
 * Elementor widget: soleman heartbeat line.
 *
 * @package SolemanHeartbeatLine
 */

namespace SolemanHeartbeatLine;

use Elementor\Controls_Manager;
use Elementor\Plugin;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * ECG trail widget that can be placed anywhere in an Elementor layout.
 */
class Widget extends Widget_Base {

	/**
	 * Widget slug.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'soleman-heartbeat-line';
	}

	/**
	 * Widget title shown in the Elementor panel.
	 *
	 * @return string
	 */
	public function get_title() {
		return esc_html__( 'soleman heartbeat line', 'soleman-heartbeat-line' );
	}

	/**
	 * Panel icon.
	 *
	 * @return string
	 */
	public function get_icon() {
		return 'eicon-animation';
	}

	/**
	 * Panel category.
	 *
	 * @return array
	 */
	public function get_categories() {
		return array( 'soleman' );
	}

	/**
	 * Search keywords.
	 *
	 * @return array
	 */
	public function get_keywords() {
		return array( 'soleman', 'heartbeat', 'ecg', '心電圖', 'line' );
	}

	/**
	 * This widget renders no dynamic post content.
	 *
	 * @return bool
	 */
	protected function is_dynamic_content(): bool {
		return false;
	}

	/**
	 * Match Elementor's optimized markup experiment.
	 *
	 * @return bool
	 */
	public function has_widget_inner_wrapper(): bool {
		return ! Plugin::$instance->experiments->is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Styles required on the frontend and in the editor preview.
	 *
	 * @return array
	 */
	public function get_style_depends(): array {
		return array( 'soleman-heartbeat-line' );
	}

	/**
	 * Scripts required on the frontend and in the editor preview.
	 *
	 * @return array
	 */
	public function get_script_depends(): array {
		return array( 'soleman-heartbeat-line' );
	}

	/**
	 * Register widget controls.
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'section_heartbeat',
			array(
				'label' => esc_html__( '心電圖', 'soleman-heartbeat-line' ),
			)
		);

		$this->add_control(
			'show_nodes',
			array(
				'label'              => esc_html__( '轉折處節點', 'soleman-heartbeat-line' ),
				'type'               => Controls_Manager::SWITCHER,
				'label_on'           => esc_html__( '顯示', 'soleman-heartbeat-line' ),
				'label_off'          => esc_html__( '隱藏', 'soleman-heartbeat-line' ),
				'return_value'       => 'yes',
				'default'            => '',
				'frontend_available' => true,
				'render_type'        => 'ui',
			)
		);

		$this->add_control(
			'node_glow',
			array(
				'label'              => esc_html__( '節點光芒', 'soleman-heartbeat-line' ),
				'type'               => Controls_Manager::SWITCHER,
				'label_on'           => esc_html__( '開啟', 'soleman-heartbeat-line' ),
				'label_off'          => esc_html__( '關閉', 'soleman-heartbeat-line' ),
				'return_value'       => 'yes',
				'default'            => '',
				'condition'          => array(
					'show_nodes' => 'yes',
				),
				'frontend_available' => true,
				'render_type'        => 'ui',
			)
		);

		$this->add_control(
			'amplitude',
			array(
				'label'              => esc_html__( '高度幅度', 'soleman-heartbeat-line' ),
				'description'        => esc_html__( '單位是 px。widget 區塊高度就等於這個幅度。', 'soleman-heartbeat-line' ),
				'type'               => Controls_Manager::SLIDER,
				'size_units'         => array( 'px' ),
				'range'              => array(
					'px' => array(
						'min'  => 24,
						'max'  => 800,
						'step' => 1,
					),
				),
				'default'            => array(
					'unit' => 'px',
					'size' => 120,
				),
				'frontend_available' => true,
				'render_type'        => 'ui',
			)
		);

		$this->add_control(
			'peak_count',
			array(
				'label'              => esc_html__( '波峰數量', 'soleman-heartbeat-line' ),
				'description'        => esc_html__( '畫面上同時出現幾個波峰。', 'soleman-heartbeat-line' ),
				'type'               => Controls_Manager::NUMBER,
				'min'                => 1,
				'max'                => 20,
				'step'               => 1,
				'default'            => 3,
				'frontend_available' => true,
				'render_type'        => 'ui',
			)
		);

		$this->add_control(
			'peak_density',
			array(
				'label'              => esc_html__( '波峰密度', 'soleman-heartbeat-line' ),
				'description'        => esc_html__( '數值越高，波峰之間的間距越小。', 'soleman-heartbeat-line' ),
				'type'               => Controls_Manager::NUMBER,
				'min'                => 1,
				'max'                => 100,
				'step'               => 1,
				'default'            => 40,
				'frontend_available' => true,
				'render_type'        => 'ui',
			)
		);

		$this->add_control(
			'effect_width',
			array(
				'label'              => esc_html__( '特效寬度', 'soleman-heartbeat-line' ),
				'description'        => esc_html__( '相對於這個 widget 所在容器的寬度。', 'soleman-heartbeat-line' ),
				'type'               => Controls_Manager::SLIDER,
				'size_units'         => array( '%' ),
				'range'              => array(
					'%' => array(
						'min'  => 5,
						'max'  => 100,
						'step' => 1,
					),
				),
				'default'            => array(
					'unit' => '%',
					'size' => 100,
				),
				'frontend_available' => true,
				'render_type'        => 'ui',
			)
		);

		$this->add_control(
			'line_width',
			array(
				'label'              => esc_html__( '線段寬度', 'soleman-heartbeat-line' ),
				'type'               => Controls_Manager::SLIDER,
				'size_units'         => array( 'px' ),
				'range'              => array(
					'px' => array(
						'min'  => 1,
						'max'  => 40,
						'step' => 1,
					),
				),
				'default'            => array(
					'unit' => 'px',
					'size' => 2,
				),
				'frontend_available' => true,
				'render_type'        => 'ui',
			)
		);

		$this->add_control(
			'duration',
			array(
				'label'              => esc_html__( '走完一輪的秒數', 'soleman-heartbeat-line' ),
				'type'               => Controls_Manager::NUMBER,
				'min'                => 0.4,
				'max'                => 60,
				'step'               => 0.1,
				'default'            => 6,
				'frontend_available' => true,
				'render_type'        => 'ui',
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style',
			array(
				'label' => esc_html__( '顏色與透明度', 'soleman-heartbeat-line' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'line_color',
			array(
				'label'              => esc_html__( '線段顏色', 'soleman-heartbeat-line' ),
				'type'               => Controls_Manager::COLOR,
				'default'            => '#2EE59D',
				'frontend_available' => true,
				'render_type'        => 'ui',
			)
		);

		$this->add_control(
			'line_opacity',
			array(
				'label'              => esc_html__( '線段透明度', 'soleman-heartbeat-line' ),
				'type'               => Controls_Manager::SLIDER,
				'size_units'         => array( '%' ),
				'range'              => array(
					'%' => array(
						'min'  => 0,
						'max'  => 100,
						'step' => 1,
					),
				),
				'default'            => array(
					'unit' => '%',
					'size' => 100,
				),
				'frontend_available' => true,
				'render_type'        => 'ui',
			)
		);

		$this->add_control(
			'node_color',
			array(
				'label'              => esc_html__( '節點顏色', 'soleman-heartbeat-line' ),
				'type'               => Controls_Manager::COLOR,
				'default'            => '#FFFFFF',
				'condition'          => array(
					'show_nodes' => 'yes',
				),
				'frontend_available' => true,
				'render_type'        => 'ui',
			)
		);

		$this->add_control(
			'node_opacity',
			array(
				'label'              => esc_html__( '節點透明度', 'soleman-heartbeat-line' ),
				'type'               => Controls_Manager::SLIDER,
				'size_units'         => array( '%' ),
				'range'              => array(
					'%' => array(
						'min'  => 0,
						'max'  => 100,
						'step' => 1,
					),
				),
				'default'            => array(
					'unit' => '%',
					'size' => 100,
				),
				'condition'          => array(
					'show_nodes' => 'yes',
				),
				'frontend_available' => true,
				'render_type'        => 'ui',
			)
		);

		$this->add_control(
			'dot_color',
			array(
				'label'              => esc_html__( '移動點顏色', 'soleman-heartbeat-line' ),
				'type'               => Controls_Manager::COLOR,
				'default'            => '#FFFFFF',
				'frontend_available' => true,
				'render_type'        => 'ui',
			)
		);

		$this->add_control(
			'dot_opacity',
			array(
				'label'              => esc_html__( '移動點透明度', 'soleman-heartbeat-line' ),
				'type'               => Controls_Manager::SLIDER,
				'size_units'         => array( '%' ),
				'range'              => array(
					'%' => array(
						'min'  => 0,
						'max'  => 100,
						'step' => 1,
					),
				),
				'default'            => array(
					'unit' => '%',
					'size' => 100,
				),
				'frontend_available' => true,
				'render_type'        => 'ui',
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render the widget HTML.
	 */
	protected function render() {
		$settings  = $this->get_settings_for_display();
		$amplitude = $this->setting_number( $settings, 'amplitude', 120, 24, 800 );
		$width     = $this->setting_number( $settings, 'effect_width', 100, 5, 100 );

		printf(
			'<div class="shl-stage" style="%s"><canvas class="shl-canvas" aria-hidden="true"></canvas></div>',
			esc_attr( 'width:' . $width . '%;height:' . $amplitude . 'px;' )
		);
	}

	/**
	 * Read a slider or number control and clamp it.
	 *
	 * @param array  $settings Widget settings.
	 * @param string $key      Control name.
	 * @param float  $fallback Fallback when the value is empty.
	 * @param float  $min      Minimum.
	 * @param float  $max      Maximum.
	 * @return float
	 */
	private function setting_number( $settings, $key, $fallback, $min, $max ) {
		if ( ! isset( $settings[ $key ] ) ) {
			return $fallback;
		}

		$value = $settings[ $key ];

		if ( is_array( $value ) ) {
			$value = isset( $value['size'] ) ? $value['size'] : '';
		}

		if ( '' === $value || null === $value || ! is_numeric( $value ) ) {
			return $fallback;
		}

		$value = (float) $value;

		return min( $max, max( $min, $value ) );
	}
}

<?php

namespace Drupal\auto_tag\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'React' Block.
 *
 * @Block(
 *   id = "react_block",
 *   admin_label = @Translation("React block"),
 *   category = @Translation("React blocks"),
 * )
 */
class ReactBlock extends BlockBase {
  public function build()
  {
    return [
      '#markup' => '<div id="react-app"></div>',
      '#attached' => ['library' => ['auto_tag/my_react_app']]
    ];
  }
}

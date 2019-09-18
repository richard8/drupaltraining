<?php

namespace Drupal\auto_tag;

use Drupal\Core\Entity\ContentEntityInterface;

interface TaggerInterface {
  public function tagEntity(ContentEntityInterface $entity);
}

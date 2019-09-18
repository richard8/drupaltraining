<?php

namespace Drupal\auto_tag;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\TypedData\Plugin\DataType\ItemList;
use Drupal\auto_tag\TaggerInterface;

class AutoTagger implements TaggerInterface {
  protected $logger;
  protected $database;
  public $entity;
  public $configValues;
  protected $taggableFields;

  const AUTOTAG_DISABLED = 'never';

  public function __construct(LoggerChannelFactoryInterface $logger, Connection $database)
  {
    $this->logger = $logger->get('auto_tag');
    $this->database = $database;
  }

  public static function tagEntityId($entityType, $entityId) {
    $entity = \Drupal::entityTypeManager()->getStorage($entityType)->load($entityId);
    \Drupal::service('simple_auto_tag')->tagEntity($entity);
  }

  public function tagEntity(ContentEntityInterface $entity) {
    $this->logger->notice("Tag Entity method fired");
    $this->entity = $entity;
    $this->configValues = \Drupal::config('auto_tag.settings')->get();
    if (!$this->isEntityTaggable()) {
      return FALSE;
    }
    $this->setTaggableFields();
    $this->tagFields();
  }

  protected function tagFields() {
    $matchingTerms = [];
    foreach ($this->taggableFields as $fieldName => $technique) {
      $terms = $this->getApplicableTerms($fieldName);
      foreach ($terms as $termId => $termName) {
        if ($this->findTermsInTextFields($termName)) {
          $matchingTerms[$termId] = $termId;
        }
      }
      $this->tagFieldWithTerms($fieldName, $matchingTerms);
    }
  }

  protected function tagFieldWithTerms($fieldName, array $matchingTerms) {
    $taggingTechnique = $this->taggableFields[$fieldName];
    switch ($taggingTechnique) {
      case 'skip':
        if (!$this->entity->get($fieldName)->isEmpty()) {
          break;
        }
      case 'replace':
        $this->entity->set($fieldName, $matchingTerms);
        break;
      case 'supplement':
      default:
        $originalTerms = $this->entity->get($fieldName)->getValue();
        foreach ($originalTerms as $term) {
          $matchingTerms[$term['target_id']] = $term['target_id'];
        }
        $this->entity->set($fieldName, $matchingTerms);
        break;
    }
  }

  protected function getApplicableTerms($fieldName) {
    $entityTypeId = $this->entity->getEntityTypeId();
    $vocabConfigKey = "type_fields_{$entityTypeId}-{$fieldName}";
    $applicableVocabs = $this->configValues[$vocabConfigKey];
    $applicableTerms = [];
    foreach ($applicableVocabs as $vocab) {
      $termsInVocab = \Drupal::service('entity_type.manager')->getStorage('taxonomy_term')->loadTree($vocab);
      foreach ($termsInVocab as $term) {
        $applicableTerms[$term->tid] = $term->name;
      }
    }
    return $applicableTerms;
  }

  protected function findTermsInTextFields($termName) {
    foreach ($this->entity->getFields() as $fields) {
      if ($fields instanceof ItemList) {
        // If this is a text field (uses an editor).
        if (in_array($fields->getFieldDefinition()->getType(), [
          'text',
          'text_long',
          'text_with_summary',
        ])) {
          foreach ($fields as $field) {
            $fieldValue = $field->getValue();
            if (is_array($fieldValue)) {
              foreach ($fieldValue as $string) {
                if (stripos($string, $termName) !== FALSE) {
                  return TRUE;
                }
              }
            }
            else if (stripos($fieldValue, $termName) !== FALSE) {
              return TRUE;
            }
          }
        }
      }
    }
    return FALSE;
  }

  protected function setTaggableFields() {
    $taggableFields = [];
    $entityTypeId = $this->entity->getEntityTypeId();
    $fieldKeyPrefix = "technique_fields_" . $entityTypeId . "-";
    foreach ($this->configValues as $key => $value) {
      // Does the $key begin with $fieldKeyPrefix?
      if (substr($key, 0, strlen($fieldKeyPrefix)) === $fieldKeyPrefix) {
        $fieldName = substr($key, strlen($fieldKeyPrefix));
        if ($value !== self::AUTOTAG_DISABLED) {
          if ($this->entity->hasField($fieldName)) {
            $taggableFields[$fieldName] = $value;
          }
        }
      }
    }
    $this->taggableFields = $taggableFields;
  }
  
  protected function isEntityTaggable() {
    $entityTypeId = $this->entity->getEntityTypeId();
    return ($this->configValues["type-$entityTypeId"] == 1) ? TRUE : FALSE;
  }
}

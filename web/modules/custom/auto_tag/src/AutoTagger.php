<?php

namespace Drupal\auto_tag;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\TypedData\Plugin\DataType\ItemList;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityTypeManagerInterface;

class AutoTagger {
  protected $entity;
  protected $configValues;
  protected $logger;
  protected $database;
  protected $entityTypeManager;
  protected $taggableFields;

  const AUTOTAG_DISABLED = 'never';

  public function __construct(LoggerChannelFactoryInterface $logger, Connection $database, EntityTypeManagerInterface $entity_type_manager) {
    $this->logger = $logger->get('auto_tag');
    $this->database = $database;
    $this->entityTypeManager = $entity_type_manager;
  }

  public function tagEntity(ContentEntityInterface $entity) {
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
    // Using the other functions in this class:
      // 1. Loop through all of the taggable fields 
      // 2. Find the relevant terms for each field
      // 3. Check if the terms are found in each field's text
      // 4. If found, add the term ID to the matchingTerms array
      // 5. Pass the field name and the matching terms to tagFieldWithTerms.
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
      $termsInVocab = $this->entityTypeManager->getStorage('taxonomy_term')->loadTree($vocab);
      foreach ($termsInVocab as $term) {
        $applicableTerms[$term->tid] = $term->name;
      }
    }
    return $applicableTerms;
  }

  protected function setTaggableFields() {
    // Find config keys prepended with: "technique_fields_".$entityTypeId . "-"
    // The field name is what follows "technique_fields_".$entityTypeId . "-"
    // For items whose config value is NOT AUTOTAG_DISABLED:
      // Create an array of Field name => Corresponding config value
      // Store that array as $this->taggableFields
    $taggableFields = [];
    $entityTypeId = $this->entity->getEntityTypeId();
    $fieldKeyPrefix = "technique_fields_" . $entityTypeId . "-";
    foreach ($this->configValues as $key => $value) {
      if (substr($key, 0, strlen($fieldKeyPrefix)) == $fieldKeyPrefix) {
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
    // Return whether the config value type-$entityTypeId is equal to 1
    $entityTypeId = $this->entity->getEntityTypeId();
    return ($this->configValues["type-$entityTypeId"] == 1) ? TRUE : FALSE;
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

}

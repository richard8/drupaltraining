<?php

namespace Drupal\auto_tag;

use Drupal\Core\TypedData\Plugin\DataType\ItemList;

class AutoTagger {

  const AUTOTAG_DISABLED = 'never';

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
      case 'replace':
      case 'supplement':
      default:
        break;
    }
  }

  protected function getApplicableTerms($fieldName) {
    $entityTypeId = $this->entity->getEntityTypeId();
    $vocabConfigKey = "type_fields_{$entityTypeId}-{$fieldName}";
    $applicableVocabs = $this->configValues[$vocabConfigKey];
    $applicableTerms = [];
    // @TODO: Get array of terms in vocab
    return $applicableTerms;
  }

  protected function setTaggableFields() {
    // Find config keys prepended with: "technique_fields_".$entityTypeId . "-"
    // The field name is what follows "technique_fields_".$entityTypeId . "-"
    // For items whose config value is NOT AUTOTAG_DISABLED:
      // Create an array of Field name => Corresponding config value
      // Store that array as $this->taggableFields
  }
  
  protected function isEntityTaggable() {
    // Return whether the config value type-$entityTypeId is equal to 1
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

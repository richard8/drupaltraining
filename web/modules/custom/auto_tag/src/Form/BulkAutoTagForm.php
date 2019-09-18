<?php

namespace Drupal\auto_tag\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Database\Connection;
use Drupal\auto_tag\AutoTagger;
use Symfony\Component\DependencyInjection\ContainerInterface;

class BulkAutoTagForm extends FormBase {
  public function getFormId() {
    return 'auto_tag_bulk_tag';
  }

  public function buildForm(array $form, \Drupal\Core\Form\FormStateInterface $form_state)
  {
    $form = [];
    $form['actions'] = [
      '#type' => 'actions',
      'submit' => [
        '#type' => 'submit',
        '#value' => $this->t('Bulk update'),
      ]
    ];
    return $form;
  }

  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    // Key: Entity type
    // Value: Corresponding entity ID column in the DB
    $entityTypeIdMap = [
      'node' => 'nid',
      'media' => 'mid'
    ];

    $configValues = \Drupal::config('auto_tag.settings')->get();
    $extractedType = [];
    $operations = [];
    foreach ($configValues as $key => $value) {
      $entityTypeMatch = [];
      // Checks if the config key is type-ENTITY_TYPE
      // Stores ENTITY_TYPE within $extractedType[1]
      // $value contains whether the entity type should be autotagged
      preg_match('/type-(.*)/', $key, $extractedType);
      // Create tagging operations
    }
    // Trigger operations using Batch API
  }
}

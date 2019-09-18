<?php

namespace Drupal\auto_tag\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Database\Connection;
use Drupal\auto_tag\AutoTagger;
use Symfony\Component\DependencyInjection\ContainerInterface;

class BulkAutoTagForm extends FormBase {

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('database'),
      $container->get('simple_auto_tag')
    );
  }

  // And apply the __construct method as you normally would for DI
  public function __construct(Connection $database, AutoTagger $autoTagger) {
    $this->database = $database;
    $this->autoTagger = $autoTagger;
  }

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
    $entityTypeIdMap = [
      'node' => 'nid',
      'media' => 'mid'
    ];
    $configValues = \Drupal::config('auto_tag.settings')->get();
    $extractedType = [];
    $operations = [];
    foreach ($configValues as $key => $value) {
      $entityTypeMatch = [];
      preg_match('/type-(.*)/', $key, $extractedType);
      if (!empty($extractedType[1]) && (bool) $value) {
        $entityType = $extractedType[1];
        $entityId = $entityTypeIdMap[$entityType];
        $query = $this->database->query("SELECT $entityId from $entityType");
        if ($query) {
          while ($row = $query->fetchAssoc()) {
            // Create bulk operations here.
            $operations[] = [
              '\Drupal\auto_tag\AutoTagger::tagEntityId',
              [$entityType, $row[$entityId]]
            ];
          }
        }
      }
    }
    // Kick off batch processing.
    $batch = [
      'init_message' => t('AutoTagging Content'),
      'operations' => $operations
    ];
    batch_set($batch);
  }
}

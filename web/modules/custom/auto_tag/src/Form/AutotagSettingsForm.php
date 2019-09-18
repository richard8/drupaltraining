<?php

namespace Drupal\auto_tag\Form;

use Drupal\Core\Form\FormStateInterface;
use Drupal\auto_tag\AutoTagger;

class AutotagSettingsForm extends \Drupal\Core\Form\ConfigFormBase {
  protected $entityFieldManager;



  public function getFormId() {
    return 'autotag_settings';
  }

  public function getEditableConfigNames() {
    return [
      'auto_tag.settings'
    ];
  }

  public function buildForm(array $form, FormStateInterface $form_state) {
    // Your code goes here.
    
//    self::buildFormDetail($form, $form_state);
    return parent::buildForm($form, $form_state);
  }

  public function buildFormDetail($form, FormStateInterface $form_state) {
    $userSubmittedValues = $form_state->getUserInput();

    $config = $this->config('auto_tag.settings');

    $referenceFields = $this->entityFieldManager->getFieldMapByFieldType('entity_reference');

    $taxonomy_fields = [];
    foreach ($referenceFields as $entity_type => $field) {
      foreach ($field as $field_name => $field_info) {
        foreach ($field_info['bundles'] as $bundle) {
          $bundle_fields = \Drupal::getContainer()->get('entity_field.manager')->getFieldDefinitions($entity_type, $bundle);
          $field_definition = $bundle_fields[$field_name];
          $field_settings = $field_definition->getSettings();
          if (!empty($field_settings['target_type']) && $field_settings['target_type'] == 'taxonomy_term') {
            $taxonomy_fields[$entity_type][$field_name] = $field_settings['handler_settings']['target_bundles'];
          }                
        }
      } 
    }

    foreach ($taxonomy_fields as $entity_type => $taggable_fields) {
      $keyed_taggable_fields = array_keys($taggable_fields);
      $keyed_taggable_fields = array_combine($keyed_taggable_fields,$keyed_taggable_fields);
      $default_val = $config->get('type-' . $entity_type);
      $form['taggable_fields']['types']['type-' . $entity_type] = [
        '#type' => 'checkbox',
        '#title' => $entity_type,
        '#default_value' => $default_val,
        '#ajax' => [
        'callback' => '::ajaxReplaceBundleForm',
          'wrapper' => 'autotag-bundles',
          'method' => 'replace',
        ],
      ];
    }

    foreach ($taxonomy_fields as $entity_type => $taggable_fields) {
      foreach ($taggable_fields as $taggable_field_name => $taggable_field_bundles) {
        $entity_type_checkbox_value = $config->get('type-' . $entity_type);
        if ((!empty($userSubmittedValues['type-' . $entity_type])) || (empty($userSubmittedValues) && $entity_type_checkbox_value)) {
          $form['taggable_fields']['autotag-bundles']["$entity_type-$taggable_field_name"] = [
            '#type' => 'details',
            '#title' => $this->t('Configure :type', [':type' => "$taggable_field_name on $entity_type"]),
            '#open' => FALSE,
            '#prefix' => '<div id="autotag-bundles">',
            '#suffix' => '</div>',
            '#weight' => 50
          ];

          $form['taggable_fields']['autotag-bundles']["$entity_type-$taggable_field_name"]['type_fields_' . $entity_type . '-' . $taggable_field_name] = [
            '#type' => 'checkboxes',
            '#title' => "Taggable terms for $entity_type:$taggable_field_name",
            '#required' => TRUE,
            '#options' => $taggable_field_bundles,
            '#default_value' => $config->get('type_fields_' . $entity_type . '-' . $taggable_field_name)
          ];

          $form['taggable_fields']['autotag-bundles']["$entity_type-$taggable_field_name"]['technique_fields_' . $entity_type . '-' . $taggable_field_name] = [
            '#type' => 'select',
            '#title' => "How autotagger should behave for $entity_type:$taggable_field_name",
            '#options' => [
              AutoTagger::AUTOTAG_DISABLED => 'Never autotag',
              'supplement' => 'Supplement existing values',
              'replace' => 'Replace existing values',
              'skip' => 'Do not autotag if any values exist',
            ],
            '#default_value' => $config->get('technique_fields_' . $entity_type . '-' . $taggable_field_name) ?? 'supplement'
          ];
        }
      }
    }
  }

  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->configFactory->getEditable('auto_tag.settings');
    $values = $form_state->getValues();
    foreach ($values as $key => $value) {
	    $config->set($key, $value);
    }
    $config->save();

    parent::submitForm($form, $form_state);
  }

  public function ajaxReplaceBundleForm($form, FormStateInterface $form_state) {
    return $form['taggable_fields']['autotag-bundles'];
  }
}

// src/composables/useAddProductState.js
import { ref } from 'vue'

// Module-level state — singleton, shared across all components
export const activeTest      = ref(null)   // { testTypeId, testTypeName }
export const selectedProduct = ref(null)   // { id, name, series_number, series }
export const sequence        = ref([])     // [{ id, testTypeId, testTypeName, sequenceOrder, isNew }]
export const parameters      = ref({})     // { [testTypeId]: [{name, value, displayOrder}] }
export const templates       = ref({})     // { [testTypeId]: [columns] }

export function useAddProductState() {
  function selectTest(test) {
    activeTest.value = test ? { testTypeId: test.testTypeId, testTypeName: test.testTypeName } : null
  }

  function setProduct(product) {
    selectedProduct.value = product
  }

  function setSequence(seq) {
    sequence.value = seq
  }

  function setParameters(params) {
    parameters.value = params
  }

  function setTemplate(testTypeId, cols) {
    templates.value = { ...templates.value, [testTypeId]: cols }
  }

  function reset() {
    activeTest.value      = null
    selectedProduct.value = null
    sequence.value        = []
    parameters.value      = {}
    templates.value       = {}
  }

  return {
    activeTest,
    selectedProduct,
    sequence,
    parameters,
    templates,
    selectTest,
    setProduct,
    setSequence,
    setParameters,
    setTemplate,
    reset,
  }
}
export const TEST_STEP_ACTIONS = [
  'OPEN_BROWSER',
  'NAVIGATE',
  'CLICK',
  'DOUBLE_CLICK',
  'RIGHT_CLICK',
  'TYPE',
  'CLEAR',
  'SELECT',
  'CHECK',
  'UNCHECK',
  'PRESS_KEY',
  'WAIT',
  'WAIT_FOR_ELEMENT',
  'VERIFY_TEXT',
  'VERIFY_ELEMENT',
  'VERIFY_URL',
  'VERIFY_TITLE',
  'UPLOAD_FILE',
  'TAKE_SCREENSHOT',
  'SCROLL',
  'HOVER',
  'DRAG_AND_DROP',
  'CLOSE_BROWSER',
] as const;

export type TestStepAction = (typeof TEST_STEP_ACTIONS)[number];

export const TEST_STEP_ACTION_LABELS: Record<TestStepAction, string> = {
  OPEN_BROWSER: 'Open Browser',
  NAVIGATE: 'Navigate',
  CLICK: 'Click',
  DOUBLE_CLICK: 'Double Click',
  RIGHT_CLICK: 'Right Click',
  TYPE: 'Type Text',
  CLEAR: 'Clear',
  SELECT: 'Select Option',
  CHECK: 'Check',
  UNCHECK: 'Uncheck',
  PRESS_KEY: 'Press Key',
  WAIT: 'Wait',
  WAIT_FOR_ELEMENT: 'Wait For Element',
  VERIFY_TEXT: 'Verify Text',
  VERIFY_ELEMENT: 'Verify Element',
  VERIFY_URL: 'Verify URL',
  VERIFY_TITLE: 'Verify Title',
  UPLOAD_FILE: 'Upload File',
  TAKE_SCREENSHOT: 'Screenshot',
  SCROLL: 'Scroll',
  HOVER: 'Hover',
  DRAG_AND_DROP: 'Drag And Drop',
  CLOSE_BROWSER: 'Close Browser',
};

export const ACTION_OPTIONS = TEST_STEP_ACTIONS.map((value) => ({
  value,
  label: TEST_STEP_ACTION_LABELS[value],
}));

export const LOCATOR_STRATEGIES = [
  'LABEL',
  'PLACEHOLDER',
  'ROLE',
  'NAME',
  'ID',
  'CSS',
  'XPATH',
  'TEXT',
  'TEST_ID',
] as const;

export type LocatorStrategy = (typeof LOCATOR_STRATEGIES)[number];

export const LOCATOR_STRATEGY_LABELS: Record<LocatorStrategy, string> = {
  LABEL: 'Label',
  PLACEHOLDER: 'Placeholder',
  ROLE: 'Role',
  NAME: 'Name',
  ID: 'ID',
  CSS: 'CSS',
  XPATH: 'XPath',
  TEXT: 'Text',
  TEST_ID: 'Test ID',
};

export const LOCATOR_OPTIONS = LOCATOR_STRATEGIES.map((value) => ({
  value,
  label: LOCATOR_STRATEGY_LABELS[value],
}));
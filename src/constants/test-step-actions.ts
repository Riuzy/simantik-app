export const TEST_STEP_ACTIONS = [
  'OPEN_BROWSER',
  'NAVIGATE',
  'RELOAD',
  'BACK',
  'FORWARD',
  'CLICK',
  'DOUBLE_CLICK',
  'RIGHT_CLICK',
  'HOVER',
  'TYPE',
  'CLEAR',
  'SELECT',
  'CHECK',
  'UNCHECK',
  'PRESS_KEY',
  'UPLOAD_FILE',
  'WAIT',
  'SCROLL',
  'DRAG_AND_DROP',
  'TAKE_SCREENSHOT',
  'CLOSE_BROWSER',
  'VERIFY_URL',
  'VERIFY_TITLE',
  'VERIFY_TEXT',
  'VERIFY_ELEMENT',
  'VERIFY_VISIBLE',
  'VERIFY_HIDDEN',
  'VERIFY_ENABLED',
  'VERIFY_DISABLED',
  'VERIFY_ATTRIBUTE',
  'VERIFY_COUNT',
] as const;

export type TestStepAction = (typeof TEST_STEP_ACTIONS)[number];

export const TEST_STEP_ACTION_LABELS: Record<TestStepAction, string> = {
  OPEN_BROWSER: 'Open Browser',
  NAVIGATE: 'Navigate',
  RELOAD: 'Reload',
  BACK: 'Back',
  FORWARD: 'Forward',
  CLICK: 'Click',
  DOUBLE_CLICK: 'Double Click',
  RIGHT_CLICK: 'Right Click',
  HOVER: 'Hover',
  TYPE: 'Type',
  CLEAR: 'Clear',
  SELECT: 'Select Option',
  CHECK: 'Check',
  UNCHECK: 'Uncheck',
  PRESS_KEY: 'Press Key',
  UPLOAD_FILE: 'Upload File',
  WAIT: 'Wait',
  SCROLL: 'Scroll',
  DRAG_AND_DROP: 'Drag and Drop',
  TAKE_SCREENSHOT: 'Take Screenshot',
  CLOSE_BROWSER: 'Close Browser',
  VERIFY_URL: 'Verify URL',
  VERIFY_TITLE: 'Verify Title',
  VERIFY_TEXT: 'Verify Text',
  VERIFY_ELEMENT: 'Verify Element',
  VERIFY_VISIBLE: 'Verify Visible',
  VERIFY_HIDDEN: 'Verify Hidden',
  VERIFY_ENABLED: 'Verify Enabled',
  VERIFY_DISABLED: 'Verify Disabled',
  VERIFY_ATTRIBUTE: 'Verify Attribute',
  VERIFY_COUNT: 'Verify Count',
};

export const ACTION_OPTIONS = TEST_STEP_ACTIONS.map((value) => ({
  value,
  label: TEST_STEP_ACTION_LABELS[value],
}));

export const LOCATOR_STRATEGIES = [
  'CSS',
  'XPATH',
  'TEXT',
  'ROLE',
  'PLACEHOLDER',
  'LABEL',
  'ARIA_LABEL',
  'TEST_ID',
  'ALT_TEXT',
  'TITLE',
] as const;

export type LocatorStrategy = (typeof LOCATOR_STRATEGIES)[number];

export const LOCATOR_STRATEGY_LABELS: Record<LocatorStrategy, string> = {
  CSS: 'CSS Selector',
  XPATH: 'XPath',
  TEXT: 'Text',
  ROLE: 'Role',
  PLACEHOLDER: 'Placeholder',
  LABEL: 'Label',
  ARIA_LABEL: 'ARIA Label',
  TEST_ID: 'Test ID',
  ALT_TEXT: 'Alt Text',
  TITLE: 'Title',
};

export const LOCATOR_OPTIONS = LOCATOR_STRATEGIES.map((value) => ({
  value,
  label: LOCATOR_STRATEGY_LABELS[value],
}));

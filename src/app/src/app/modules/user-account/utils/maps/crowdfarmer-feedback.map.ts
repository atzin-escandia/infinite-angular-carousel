export enum ORDER_FEEDBACK_KEYS {
  DONTLIKE = 'dontLike',
  AVERAGE = 'average',
  LIKE = 'like'
}

export const ORDER_FEEDBACK_MAP: Map<string, number> = new Map([
  [ORDER_FEEDBACK_KEYS.LIKE, 1],
  [ORDER_FEEDBACK_KEYS.AVERAGE, 0],
  [ORDER_FEEDBACK_KEYS.DONTLIKE, -1]
]);

export const ORDER_FEEDBACK_SURVEY_NAME_MAP: Map<string, string> = new Map([
  ['crowdfarmersFeedbackLike', 'page.what-like-most.title'],
  ['crowdfarmersFeedbackDontLike', 'page.what-went-wrong.title'],
  ['crowdfarmersFeedbackAverage', 'page.what-like-least.title']
]);

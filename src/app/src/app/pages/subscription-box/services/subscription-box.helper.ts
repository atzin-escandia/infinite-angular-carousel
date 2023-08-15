import {
  SubscriptionBox,
  SubscriptionBoxJson,
  SubscriptionPlan,
  SubscriptionStripePlan,
  UserActiveSubscription,
  UserSubscription,
} from '@app/pages/subscription-box/interfaces/subscription-box.interface';
import dayjs from 'dayjs';

export const deserializePlan = (boxes: SubscriptionBoxJson[], plan: SubscriptionStripePlan): SubscriptionPlan => ({
  price: plan.priceAmount,
  planId: plan.id,
  nextBox: getNextBox(boxes),
  boxes: boxes.map((box) => deserializeBox(box)),
});

export const deserializeBox = (box: SubscriptionBoxJson): SubscriptionBox => ({
  deliveryDate: new Date(box.deliveryAt),
  image: box.masterBox.image,
  monthText: getMonthNameText(box.month).toLowerCase(),
  monthNumber: box.month,
  processDate: new Date(box.processAt),
  billingDate: new Date(box.billingAt),
  sendDate: new Date(box.sendAt),
  multiLangTitle: box.masterBox._m_title,
  year: box.year,
});

export const deserializeActiveSubscription = (subscription: UserSubscription, boxes: SubscriptionBoxJson[]): UserActiveSubscription => ({
  subscriptionId: subscription.id,
  planId: subscription.plan.id,
  price: subscription.plan.priceAmount,
  deliveryDate: new Date(getNextDate(boxes[0].deliveryAt, boxes[1].deliveryAt)),
  processDate: new Date(boxes[0].processAt),
  billingDate: new Date(getNextDate(boxes[0].billingAt, boxes[1].billingAt)),
});

export const getMonthNameText = (monthNumber: number): string => {
  const date = dayjs().month(monthNumber - 1);

  return date.format('MMMM').toLowerCase();
};

export const getNextBox = (boxes: SubscriptionBoxJson[]): number => {
  // Check if the current date is before the processing date
  const nextBox = boxes.filter((box) => dayjs().isBefore(dayjs(box.processAt)))[0];

  return boxes.indexOf(nextBox);
};

export const getNextDate = (dateMonth0: Date, dateMonth1: Date): Date => {
  // Check if the current date is before the actual date
  const nextDate = dayjs().isBefore(dayjs(dateMonth0)) ? dateMonth0 : dateMonth1;

  return nextDate;
};

export const getUserAreaBoxName = (date: Date): string => {
  const month = dayjs(date).month() + 1;

  return `discoverybox.global.${getMonthNameText(month)}.month`;
};

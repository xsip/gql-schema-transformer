
enum BillingPlan {
    FREE = 'FREE' as any,
SOLO = 'SOLO' as any,
TEAM = 'TEAM' as any
};
export interface CurrentUser {
    id?: any;
authToken?: string;
firstName?: string;
lastName?: string;
email?: string;
mobile?: string;
isOwner?: boolean;
company?: Company;

};
export interface Company {
    id?: any;
name?: string;

};
export interface Billing {
    trialDaysLeft?: number;
plan?: BillingPlan;
card?: Card;
nextPaymentDue?: string;

};
export interface Card {
    lastFourDigits?: string;
type?: string;

};
enum BillingPlan {
    FREE = 'FREE' as any,
    SOLO = 'SOLO' as any,
    TEAM = 'TEAM' as any
};

export interface CurrentUser {
    id?: string;
    authToken?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    mobile?: string;
    isOwner?: boolean;
    company?: Company;

};

export interface Company {
    id?: string;
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
import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';
import {Observable} from 'rxjs';
import {ApolloQueryResult} from 'apollo-client';

//  import * as typDefs from './gql-type-interfaces';

class QueryService {
    constructor(private apollo: Apollo) {

    }


    public currentUserQuery(data: {}, includeInResponse: { [index: string]: boolean | any } = {
        id: false,
        authToken: false,
        firstName: false,
        lastName: false,
        email: false,
        mobile: false,
        isOwner: false,
        company: {
            id: false,
            name: false
        }
    }):
        Observable<ApolloQueryResult<CurrentUser>> {
        return this.apollo.query({
            query: gql`
            query currentUser() {
              currentUser() {
                ${includeInResponse.id ? 'id' : '' }
${includeInResponse.authToken ? 'authToken' : '' }
${includeInResponse.firstName ? 'firstName' : '' }
${includeInResponse.lastName ? 'lastName' : '' }
${includeInResponse.email ? 'email' : '' }
${includeInResponse.mobile ? 'mobile' : '' }
${includeInResponse.isOwner ? 'isOwner' : '' }
company {${includeInResponse.id ? 'id' : '' }
${includeInResponse.name ? 'name' : '' }
}

              }
            }
        `,
            variables: {},
        }) as
            Observable<ApolloQueryResult<CurrentUser>>;

    };

    public billingQuery(data: {}, includeInResponse: { [index: string]: boolean | any } = {
        trialDaysLeft: false,
        plan: false,
        card: {
            lastFourDigits: false,
            type: false
        },
        nextPaymentDue: false
    }):
        Observable<ApolloQueryResult<Billing>> {
        return this.apollo.query({
            query: gql`
            query billing() {
              billing() {
                ${includeInResponse.trialDaysLeft ? 'trialDaysLeft' : '' }
${includeInResponse.plan ? 'plan' : '' }
card {${includeInResponse.lastFourDigits ? 'lastFourDigits' : '' }
${includeInResponse.type ? 'type' : '' }
}
${includeInResponse.nextPaymentDue ? 'nextPaymentDue' : '' }

              }
            }
        `,
            variables: {},
        }) as
            Observable<ApolloQueryResult<Billing>>;

    };

}

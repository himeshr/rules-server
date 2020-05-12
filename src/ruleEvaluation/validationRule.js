import * as rulesConfig from 'rules-config';
import lodash from 'lodash';
import moment from 'moment';

export const validationRule = async (rule,entity) => {
    const ruleFunc = eval(rule);
    const ruleValidations = ruleFunc({
        params: {entity},
        imports: { rulesConfig, lodash , moment }
    });
    return ruleValidations;
}
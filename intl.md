##### 国际化
```
import {injectIntl, defineMessages} from 'react-intl';

const messages = defineMessages({
    hello: {
        id: 'hello',
        defaultMessage: '1111'
    }
});

@injectIntl
class Authority extends React.Component {}


this.props.intl.formatMessage(messages.btn_back)

```
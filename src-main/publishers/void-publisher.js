//@flow

/*::
import type { IPublisher, PublishContext } from './types';
*/

class VoidPublisher/*:: implements IPublisher*/{
    publish(context/*: PublishContext*/)/*: Promise<void>*/{
        return Promise.resolve();
    }
}

module.exports = VoidPublisher;
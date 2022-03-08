import { ApiPromise } from '@polkadot/api';
import { ISubmittableResult } from '@polkadot/types/types';
import { SubmittableExtrinsic, AddressOrPair } from '@polkadot/api/types';

export class SignedExtrinsicExecutor {
    api: ApiPromise;
    call: SubmittableExtrinsic<'promise'>;
    sender: AddressOrPair;

    onFinality: (blockHash: string) => void;
    unsubscribe: any;
    
    constructor(
        polkadotApi: ApiPromise,
        call: SubmittableExtrinsic<'promise'>,
        sender: AddressOrPair,
        onFinality: (blockHash: string) => void
    ) {
        this.api = polkadotApi;
        this.call = call;
        this.sender = sender;

        this.onFinality = onFinality;
    }


    public async executeTransaction(): Promise<void> {
        this.unsubscribe = await this.call.signAndSend(this.sender, (res: ISubmittableResult) => {
            const { status } = res;

            if (status.asFinalized) {
                this.onFinality(status.asFinalized.toString());

                this.unsubscribe();
            }
        })
    }
}
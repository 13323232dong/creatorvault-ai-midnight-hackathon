import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  submitIncomeProof(context: __compactRuntime.CircuitContext<PS>,
                    creatorIdHash_0: Uint8Array,
                    periodHash_0: Uint8Array,
                    proofSchemaVersion_0: bigint,
                    incomeThresholdUsdCents_0: bigint,
                    supporterThreshold_0: bigint,
                    proofCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type ProvableCircuits<PS> = {
  submitIncomeProof(context: __compactRuntime.CircuitContext<PS>,
                    creatorIdHash_0: Uint8Array,
                    periodHash_0: Uint8Array,
                    proofSchemaVersion_0: bigint,
                    incomeThresholdUsdCents_0: bigint,
                    supporterThreshold_0: bigint,
                    proofCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type PureCircuits = {
  computeProofKey(creatorIdHash_0: Uint8Array,
                  periodHash_0: Uint8Array,
                  proofSchemaVersion_0: bigint,
                  incomeThresholdUsdCents_0: bigint,
                  supporterThreshold_0: bigint,
                  proofCommitment_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  submitIncomeProof(context: __compactRuntime.CircuitContext<PS>,
                    creatorIdHash_0: Uint8Array,
                    periodHash_0: Uint8Array,
                    proofSchemaVersion_0: bigint,
                    incomeThresholdUsdCents_0: bigint,
                    supporterThreshold_0: bigint,
                    proofCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  computeProofKey(context: __compactRuntime.CircuitContext<PS>,
                  creatorIdHash_0: Uint8Array,
                  periodHash_0: Uint8Array,
                  proofSchemaVersion_0: bigint,
                  incomeThresholdUsdCents_0: bigint,
                  supporterThreshold_0: bigint,
                  proofCommitment_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type Ledger = {
  readonly proofCount: bigint;
  readonly latestProofKey: Uint8Array;
  readonly latestCreatorIdHash: Uint8Array;
  readonly latestPeriodHash: Uint8Array;
  readonly latestProofSchemaVersion: bigint;
  readonly latestIncomeThresholdUsdCents: bigint;
  readonly latestSupporterThreshold: bigint;
  readonly latestProofCommitment: Uint8Array;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;

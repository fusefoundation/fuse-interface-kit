// Bindings for fuse-interface.did. Keep the Candid and read-only round tests in sync.
export const idlFactory = ({ IDL }) => {
  const MoneySource = IDL.Record({
    'app' : IDL.Principal,
    'ledger' : IDL.Principal,
    'local_test' : IDL.Bool,
  });
  const CharityGoalDraft = IDL.Record({
    'title' : IDL.Text,
    'details' : IDL.Text,
  });
  const MoneyRequest = IDL.Variant({
    'SiteVerify' : IDL.Null,
    'SiteBeginClose' : IDL.Null,
    'SiteBondScan' : IDL.Record({ 'max_blocks' : IDL.Nat32 }),
    'SiteBondStartScan' : IDL.Null,
    'OwnerResume' : IDL.Null,
    'OwnerOperatorPayout' : IDL.Record({ 'gross' : IDL.Nat }),
    'OwnerCodeExplain' : IDL.Record({
      'change_id' : IDL.Nat64,
      'text' : IDL.Text,
    }),
    'SitePayoutScan' : IDL.Record({
      'request_id' : IDL.Nat,
      'max_blocks' : IDL.Nat32,
    }),
    'OwnerPause' : IDL.Null,
    'OwnerCharityPayout' : IDL.Record({
      'destination' : IDL.Principal,
      'gross' : IDL.Nat,
      'purpose' : IDL.Text,
    }),
    'SiteActivate' : IDL.Null,
    'SitePayout' : IDL.Record({
      'gross' : IDL.Nat,
      'interface_id' : IDL.Nat64,
    }),
    'OwnerCharityReport' : IDL.Record({
      'request_id' : IDL.Nat,
      'text' : IDL.Opt(IDL.Text),
    }),
    'OwnerLedgerScan' : IDL.Record({ 'max_blocks' : IDL.Nat32 }),
    'DepositTransfer' : IDL.Record({
      'fee' : IDL.Nat,
      'memo' : IDL.Vec(IDL.Nat8),
      'created_at_time' : IDL.Nat64,
      'interface_id' : IDL.Nat64,
      'amount' : IDL.Nat,
    }),
    'OwnerFundTransfer' : IDL.Record({
      'fee' : IDL.Nat,
      'memo' : IDL.Vec(IDL.Nat8),
      'created_at_time' : IDL.Nat64,
      'amount' : IDL.Nat,
    }),
    'SiteDepositScan' : IDL.Record({ 'max_blocks' : IDL.Nat32 }),
    'OwnerFundConfigure' : IDL.Record({ 'units' : IDL.Nat }),
    'ScanPayout' : IDL.Record({
      'request_id' : IDL.Nat,
      'max_blocks' : IDL.Nat32,
    }),
    'OwnerPayoutScan' : IDL.Record({
      'request_id' : IDL.Nat,
      'max_blocks' : IDL.Nat32,
    }),
    'OwnerAutomation' : IDL.Record({ 'enabled' : IDL.Bool }),
    'WinnerPayout' : IDL.Record({ 'gross' : IDL.Nat }),
    'OwnerCharityGoal' : IDL.Record({
      'goal' : IDL.Opt(CharityGoalDraft),
      'expected_revision' : IDL.Nat64,
    }),
    'PrepareDeposit' : IDL.Record({
      'interface_id' : IDL.Nat64,
      'amount' : IDL.Nat,
    }),
    'OwnerFundWithdraw' : IDL.Record({ 'gross' : IDL.Nat }),
    'SiteApprove' : IDL.Record({
      'fee' : IDL.Nat,
      'created_at_time' : IDL.Nat64,
      'amount' : IDL.Nat,
      'expected_allowance' : IDL.Nat,
      'expires_at' : IDL.Nat64,
    }),
    'SiteClaim' : IDL.Record({
      'domain' : IDL.Text,
      'payout_principal' : IDL.Principal,
    }),
    'SiteClose' : IDL.Null,
    'SiteRelease' : IDL.Null,
  });
  const IncomingStage = IDL.Variant({
    'NotSent' : IDL.Record({ 'reason' : IDL.Text }),
    'Unsigned' : IDL.Null,
    'Ledger' : IDL.Record({
      'unattributed' : IDL.Bool,
      'ledger_block' : IDL.Nat,
      'credited' : IDL.Bool,
    }),
    'Pending' : IDL.Null,
  });
  const IncomingView = IDL.Record({
    'request_id' : IDL.Vec(IDL.Nat8),
    'content' : IDL.Vec(IDL.Nat8),
    'ingress_expiry' : IDL.Nat64,
    'source' : MoneySource,
    'owner' : IDL.Principal,
    'request' : MoneyRequest,
    'operation_id' : IDL.Vec(IDL.Nat8),
    'confirmed_pending_micro_units' : IDL.Opt(IDL.Nat),
    'stage' : IncomingStage,
    'wallet_transport' : IDL.Opt(IDL.Bool),
    'scan_next' : IDL.Nat64,
    'storage_bytes' : IDL.Nat64,
    'revision' : IDL.Nat64,
    'ready' : IDL.Bool,
  });
  const Result_13 = IDL.Variant({ 'Ok' : IncomingView, 'Err' : IDL.Text });
  const SiteApprovalStage = IDL.Variant({
    'NotSent' : IDL.Record({ 'reason' : IDL.Text }),
    'Approved' : IDL.Record({ 'ledger_block' : IDL.Nat }),
    'Unsigned' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const SiteApprovalView = IDL.Record({
    'request_id' : IDL.Vec(IDL.Nat8),
    'content' : IDL.Vec(IDL.Nat8),
    'ingress_expiry' : IDL.Nat64,
    'source' : MoneySource,
    'owner' : IDL.Principal,
    'request' : MoneyRequest,
    'operation_id' : IDL.Vec(IDL.Nat8),
    'stage' : SiteApprovalStage,
    'scan_next' : IDL.Nat64,
    'storage_bytes' : IDL.Nat64,
    'revision' : IDL.Nat64,
    'ready' : IDL.Bool,
    'claim_binding' : IDL.Vec(IDL.Nat8),
  });
  const Result_14 = IDL.Variant({ 'Ok' : SiteApprovalView, 'Err' : IDL.Text });
  const BondApprovalQuote = IDL.Record({
    'minimum_allowance_micro_ckusdt' : IDL.Nat,
    'estimated_ledger_fee_micro_ckusdt' : IDL.Nat,
    'ledger' : IDL.Principal,
    'bond_amount_micro_ckusdt' : IDL.Nat,
    'spender' : IDL.Principal,
  });
  const Result_21 = IDL.Variant({ 'Ok' : BondApprovalQuote, 'Err' : IDL.Text });
  const IncomingRequest = IDL.Variant({
    'Deposit' : IDL.Record({ 'interface_id' : IDL.Nat64, 'amount' : IDL.Nat }),
    'OwnerFund' : IDL.Record({ 'amount' : IDL.Nat }),
  });
  const PayoutCapabilitiesV2 = IDL.Record({
    'max_scan_blocks' : IDL.Nat32,
    'api_version' : IDL.Nat16,
    'source' : MoneySource,
    'linked_external_allowed' : IDL.Bool,
    'supports_subaccounts' : IDL.Bool,
  });
  const Result_41 = IDL.Variant({
    'Ok' : PayoutCapabilitiesV2,
    'Err' : IDL.Text,
  });
  const IncomeKindV3 = IDL.Variant({
    'Operator' : IDL.Null,
    'Interface' : IDL.Nat64,
  });
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const PayoutStageView = IDL.Variant({
    'NotSent' : IDL.Null,
    'Paid' : IDL.Record({ 'at_ns' : IDL.Nat64, 'ledger_block' : IDL.Nat }),
    'Unknown' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const IncomePayoutViewV3 = IDL.Record({
    'fee' : IDL.Nat,
    'net' : IDL.Nat,
    'request_id' : IDL.Nat,
    'source' : MoneySource,
    'created_at_time_ns' : IDL.Nat64,
    'kind' : IncomeKindV3,
    'memo' : IDL.Vec(IDL.Nat8),
    'recipient' : Account,
    'stage' : PayoutStageView,
    'selected_recipient' : IDL.Bool,
    'scan_next' : IDL.Opt(IDL.Nat64),
    'gross' : IDL.Nat,
    'account' : IDL.Principal,
  });
  const Result_42 = IDL.Variant({
    'Ok' : IncomePayoutViewV3,
    'Err' : IDL.Text,
  });
  const InterfaceDataAutomationStatus = IDL.Record({
    'last_error' : IDL.Opt(IDL.Text),
    'consecutive_errors' : IDL.Nat32,
    'next_check_ns' : IDL.Opt(IDL.Nat64),
    'last_success_ns' : IDL.Opt(IDL.Nat64),
    'completed_steps' : IDL.Nat64,
    'last_attempt_ns' : IDL.Opt(IDL.Nat64),
    'phase' : IDL.Text,
  });
  const Capabilities = IDL.Record({
    'methods' : IDL.Vec(IDL.Text),
    'max_page_items' : IDL.Nat32,
    'api_version' : IDL.Nat32,
    'max_sync_items' : IDL.Nat32,
    'query_certified' : IDL.Bool,
    'external_notification_delivery' : IDL.Bool,
    'token_decimals' : IDL.Nat8,
    'full_participant_roster_public' : IDL.Bool,
  });
  const InterfaceView = IDL.Record({
    'id' : IDL.Nat64,
    'controller' : IDL.Principal,
    'registered_at_ns' : IDL.Nat64,
    'payout_principal' : IDL.Principal,
  });
  const InterfaceMemoView = IDL.Record({
    'registration' : InterfaceView,
    'memo' : IDL.Vec(IDL.Nat8),
    'issued_at_ns' : IDL.Nat64,
    'interface_id' : IDL.Nat64,
  });
  const Result_46 = IDL.Variant({
    'Ok' : IDL.Opt(InterfaceMemoView),
    'Err' : IDL.Text,
  });
  const Result_47 = IDL.Variant({
    'Ok' : IDL.Opt(InterfaceView),
    'Err' : IDL.Text,
  });
  const IncomeFundsV3 = IDL.Record({
    'needs_reconciliation' : IDL.Bool,
    'source' : MoneySource,
    'kind' : IncomeKindV3,
    'reserved' : IDL.Nat,
    'available' : IDL.Nat,
    'account' : IDL.Principal,
    'pending_payout_id' : IDL.Opt(IDL.Nat),
    'revision' : IDL.Nat64,
    'own_recipient' : Account,
  });
  const Result_57 = IDL.Variant({ 'Ok' : IncomeFundsV3, 'Err' : IDL.Text });
  const Result_58 = IDL.Variant({
    'Ok' : IDL.Opt(IncomingView),
    'Err' : IDL.Text,
  });
  const IncomingStatus = IDL.Record({
    'latest' : IDL.Opt(IncomingView),
    'next_revision' : IDL.Nat64,
    'root_available' : IDL.Bool,
  });
  const Result_50 = IDL.Variant({ 'Ok' : IncomingStatus, 'Err' : IDL.Text });
  const BondReleaseView = IDL.Record({
    'confirmed_deposits_micro_ckusdt' : IDL.Nat,
    'interface_open' : IDL.Bool,
    'qualified_at_ns' : IDL.Nat64,
  });
  const BondClosureView = IDL.Record({
    'effective_at_ns' : IDL.Nat64,
    'requested_at_ns' : IDL.Opt(IDL.Nat64),
  });
  const BondStage = IDL.Variant({
    'Refunding' : IDL.Null,
    'Collecting' : IDL.Null,
    'Closed' : IDL.Null,
    'Active' : IDL.Null,
    'Funded' : IDL.Null,
  });
  const BondView = IDL.Record({
    'bond_account_subaccount' : IDL.Vec(IDL.Nat8),
    'controller' : IDL.Principal,
    'domain' : IDL.Text,
    'refund_fee_micro_ckusdt' : IDL.Opt(IDL.Nat),
    'release' : IDL.Opt(BondReleaseView),
    'outcome_uncertain' : IDL.Bool,
    'closure' : IDL.Opt(BondClosureView),
    'stage' : BondStage,
    'amount_micro_ckusdt' : IDL.Nat,
    'ledger' : IDL.Principal,
    'refund_block' : IDL.Opt(IDL.Nat),
    'collection_fee_micro_ckusdt' : IDL.Nat,
    'payout_principal' : IDL.Principal,
    'interface_id' : IDL.Opt(IDL.Nat64),
    'collection_block' : IDL.Opt(IDL.Nat),
  });
  const Result_59 = IDL.Variant({ 'Ok' : IDL.Opt(BondView), 'Err' : IDL.Text });
  const InterfaceFundsView = IDL.Record({
    'needs_reconciliation' : IDL.Bool,
    'controller' : IDL.Principal,
    'reserved_gross_micro_units' : IDL.Nat,
    'pending_payout_id' : IDL.Opt(IDL.Nat),
    'available_micro_units' : IDL.Nat,
    'payout_principal' : IDL.Principal,
    'interface_id' : IDL.Nat64,
  });
  const Result_60 = IDL.Variant({
    'Ok' : IDL.Opt(InterfaceFundsView),
    'Err' : IDL.Text,
  });
  const LedgerEnvironmentView = IDL.Variant({
    'MainnetCkUsdt' : IDL.Null,
    'LocalTest' : IDL.Null,
  });
  const TrustedLedgerView = IDL.Record({
    'decimals' : IDL.Nat8,
    'ledger' : IDL.Principal,
    'financial_ingest_enabled' : IDL.Bool,
    'environment' : LedgerEnvironmentView,
    'pinned_at_ns' : IDL.Nat64,
  });
  const WalletFundsView = IDL.Record({
    'needs_reconciliation' : IDL.Bool,
    'winnings_available_micro_units' : IDL.Nat,
    'prepaid_micro_units' : IDL.Nat,
    'pending_payout_id' : IDL.Opt(IDL.Nat),
    'wallet' : IDL.Principal,
    'winnings_reserved_micro_units' : IDL.Nat,
    'confirmed_pending_prepayment_micro_units' : IDL.Opt(IDL.Nat),
    'trusted_ledger' : IDL.Opt(TrustedLedgerView),
  });
  const Result_70 = IDL.Variant({ 'Ok' : WalletFundsView, 'Err' : IDL.Text });
  const SelectedWinnerRequestV2 = IDL.Record({
    'fee' : IDL.Nat,
    'source' : MoneySource,
    'recipient' : Account,
    'gross' : IDL.Nat,
    'account' : IDL.Principal,
    'own_account' : IDL.Bool,
  });
  const WinnerPayoutViewV2 = IDL.Record({
    'fee' : IDL.Nat,
    'net' : IDL.Nat,
    'request_id' : IDL.Nat,
    'source' : MoneySource,
    'created_at_time_ns' : IDL.Nat64,
    'memo' : IDL.Vec(IDL.Nat8),
    'recipient' : Account,
    'stage' : PayoutStageView,
    'selected_recipient' : IDL.Bool,
    'scan_next' : IDL.Opt(IDL.Nat64),
    'gross' : IDL.Nat,
    'account' : IDL.Principal,
  });
  const WinnerChoiceViewV2 = IDL.Record({
    'request' : SelectedWinnerRequestV2,
    'revision' : IDL.Nat64,
    'payout' : WinnerPayoutViewV2,
  });
  const SelectedIncomeV3 = IDL.Record({
    'fee' : IDL.Nat,
    'source' : MoneySource,
    'kind' : IncomeKindV3,
    'recipient' : Account,
    'gross' : IDL.Nat,
    'account' : IDL.Principal,
    'own_account' : IDL.Bool,
  });
  const IncomeChoiceV3 = IDL.Record({
    'request' : SelectedIncomeV3,
    'revision' : IDL.Nat64,
    'payout' : IncomePayoutViewV3,
  });
  const PaymentOwnerView = IDL.Variant({
    'Operator' : IDL.Null,
    'Winner' : IDL.Text,
    'Charity' : IDL.Null,
    'Interface' : IDL.Nat64,
  });
  const PayoutRequestView = IDL.Record({
    'fee' : IDL.Nat,
    'net' : IDL.Nat,
    'request_id' : IDL.Nat,
    'destination' : IDL.Principal,
    'created_at_time_ns' : IDL.Nat64,
    'owner' : PaymentOwnerView,
    'memo' : IDL.Vec(IDL.Nat8),
    'owner_fund_source' : IDL.Opt(IDL.Bool),
    'stage' : PayoutStageView,
    'scan_next' : IDL.Opt(IDL.Nat64),
    'gross' : IDL.Nat,
    'purpose' : IDL.Opt(IDL.Text),
  });
  const PayoutChoiceView = IDL.Record({
    'request' : MoneyRequest,
    'revision' : IDL.Nat64,
    'payout' : PayoutRequestView,
  });
  const ChoiceViewV3 = IDL.Variant({
    'Winner' : WinnerChoiceViewV2,
    'Income' : IncomeChoiceV3,
    'Legacy' : PayoutChoiceView,
  });
  const Result_71 = IDL.Variant({
    'Ok' : IDL.Opt(ChoiceViewV3),
    'Err' : IDL.Text,
  });
  const Result_75 = IDL.Variant({
    'Ok' : IDL.Opt(SiteApprovalView),
    'Err' : IDL.Text,
  });
  const SiteApprovalStatus = IDL.Record({
    'latest' : IDL.Opt(SiteApprovalView),
    'next_revision' : IDL.Nat64,
    'root_available' : IDL.Bool,
  });
  const Result_76 = IDL.Variant({
    'Ok' : SiteApprovalStatus,
    'Err' : IDL.Text,
  });
  const SiteBondContext = IDL.Record({
    'controller' : IDL.Principal,
    'closure_revision' : IDL.Opt(IDL.Nat64),
    'claim_id' : IDL.Nat64,
    'ledger' : IDL.Principal,
    'claim_binding' : IDL.Vec(IDL.Nat8),
  });
  const Result_77 = IDL.Variant({
    'Ok' : IDL.Opt(SiteBondContext),
    'Err' : IDL.Text,
  });
  const SiteClaimView = IDL.Record({
    'id' : IDL.Nat64,
    'controller' : IDL.Principal,
    'verification_url' : IDL.Text,
    'domain' : IDL.Text,
    'valid_until_ns' : IDL.Opt(IDL.Nat64),
    'verified_at_ns' : IDL.Opt(IDL.Nat64),
    'last_checked_at_ns' : IDL.Opt(IDL.Nat64),
    'verification_text' : IDL.Text,
    'payout_principal' : IDL.Principal,
    'requested_at_ns' : IDL.Nat64,
  });
  const Result_78 = IDL.Variant({
    'Ok' : IDL.Opt(SiteClaimView),
    'Err' : IDL.Text,
  });
  const MoneyObservation = IDL.Record({
    'certificate' : IDL.Vec(IDL.Nat8),
    'reply' : IDL.Vec(IDL.Nat8),
  });
  const Progress = IDL.Record({
    'winners_processed' : IDL.Nat64,
    'available_tours' : IDL.Nat64,
    'caught_up' : IDL.Bool,
    'indexed_rosters_complete' : IDL.Bool,
    'indexed_through_cycle' : IDL.Nat64,
    'roster_processed' : IDL.Nat64,
    'building_cycle' : IDL.Opt(IDL.Nat64),
  });
  const Totals_1 = IDL.Record({
    'virtual_contributions_micro_units' : IDL.Nat,
    'winner_awards' : IDL.Nat,
    'unique_wallets_in_available_rosters' : IDL.Nat64,
    'prizes_accrued_micro_units' : IDL.Nat,
    'interfaces_accrued_micro_units' : IDL.Nat,
    'paid_wallet_participations' : IDL.Nat,
    'real_contributions_micro_units' : IDL.Nat,
    'operator_accrued_micro_units' : IDL.Nat,
    'owner_fund_contributions_micro_units' : IDL.Nat,
    'gross_contributions_micro_units' : IDL.Nat,
    'charity_accrued_micro_units' : IDL.Nat,
    'virtual_reserve_accrued_micro_units' : IDL.Nat,
  });
  const ProjectStatistics = IDL.Record({
    'accounted_received_micro_units' : IDL.Nat,
    'project_subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'api_version' : IDL.Nat32,
    'observed_at_ns' : IDL.Nat64,
    'payout_requests' : IDL.Nat64,
    'progress' : Progress,
    'unique_paid_wallets_in_indexed_tours' : IDL.Opt(IDL.Nat64),
    'ledger' : IDL.Text,
    'pending_cycle_id' : IDL.Opt(IDL.Nat64),
    'financial_wallet_records' : IDL.Nat64,
    'token_decimals' : IDL.Nat8,
    'totals_of_indexed_tours' : Totals_1,
    'accounted_paid_micro_units' : IDL.Nat,
    'pause_events' : IDL.Nat64,
    'credited_deposit_blocks' : IDL.Nat64,
    'paused' : IDL.Bool,
    'project_account' : IDL.Text,
  });
  const Result_92 = IDL.Variant({ 'Ok' : ProjectStatistics, 'Err' : IDL.Text });
  const InterfaceDepositView = IDL.Record({
    'confirmed_original_total_micro_units' : IDL.Opt(IDL.Nat),
    'threshold_micro_units' : IDL.Nat,
    'threshold_met' : IDL.Bool,
    'history_complete' : IDL.Bool,
    'interface_id' : IDL.Nat64,
    'confirmed_at_least_micro_units' : IDL.Nat,
  });
  const Result_104 = IDL.Variant({
    'Ok' : InterfaceDepositView,
    'Err' : IDL.Text,
  });
  const PrizeCursor = IDL.Record({
    'cycle_id' : IDL.Nat64,
    'winner_offset' : IDL.Nat64,
  });
  const PrizeEvent = IDL.Record({
    'cursor' : PrizeCursor,
    'tour_day_start_ns' : IDL.Nat64,
    'accrued_micro_units' : IDL.Nat,
    'roster_audit_available' : IDL.Bool,
    'utc_day' : IDL.Nat64,
    'wallet' : IDL.Text,
    'event_id' : IDL.Text,
  });
  const PrizePage = IDL.Record({
    'available_tours' : IDL.Nat64,
    'next_after' : IDL.Opt(PrizeCursor),
    'caught_up' : IDL.Bool,
    'indexed_through_cycle' : IDL.Nat64,
    'items' : IDL.Vec(PrizeEvent),
  });
  const Result_74 = IDL.Variant({ 'Ok' : PrizePage, 'Err' : IDL.Text });
  const PublicProtocolStatus = IDL.Record({
    'next_cycle_day' : IDL.Opt(IDL.Nat64),
    'tours' : IDL.Nat64,
    'paused' : IDL.Bool,
  });
  const Result_112 = IDL.Variant({
    'Ok' : PublicProtocolStatus,
    'Err' : IDL.Text,
  });
  const RecipientChoiceV2 = IDL.Variant({
    'OwnAccount' : IDL.Null,
    'OtherAccount' : Account,
  });
  const IncomeInputV3 = IDL.Record({
    'source' : MoneySource,
    'kind' : IncomeKindV3,
    'recipient' : RecipientChoiceV2,
    'gross' : IDL.Nat,
    'account' : IDL.Principal,
  });
  const Result_119 = IDL.Variant({ 'Ok' : ChoiceViewV3, 'Err' : IDL.Text });
  const Result_121 = IDL.Variant({ 'Ok' : SiteClaimView, 'Err' : IDL.Text });
  const IncomeRecoveryV3 = IDL.Record({
    'blocks_scanned' : IDL.Nat32,
    'tip_at_start' : IDL.Nat64,
    'next_index' : IDL.Nat64,
    'request' : IncomePayoutViewV3,
    'matched_block' : IDL.Opt(IDL.Nat),
  });
  const Result_124 = IDL.Variant({ 'Ok' : IncomeRecoveryV3, 'Err' : IDL.Text });
  const BondRecoveryView = IDL.Record({
    'blocks_scanned' : IDL.Nat32,
    'tip_at_start' : IDL.Nat64,
    'next_index' : IDL.Nat64,
    'bond' : BondView,
    'matched_block' : IDL.Opt(IDL.Nat),
  });
  const Result_126 = IDL.Variant({ 'Ok' : BondRecoveryView, 'Err' : IDL.Text });
  const SiteBondAction = IDL.Variant({
    'Release' : IDL.Null,
    'Fund' : IDL.Null,
    'BeginCloseAt' : IDL.Record({ 'revision' : IDL.Nat64 }),
    'BeginClose' : IDL.Null,
    'Activate' : IDL.Null,
    'CancelClose' : IDL.Record({
      'requested_at_ns' : IDL.Nat64,
      'revision' : IDL.Nat64,
    }),
    'Close' : IDL.Null,
  });
  const Result_1 = IDL.Variant({ 'Ok' : BondView, 'Err' : IDL.Text });
  const QuoteView = IDL.Record({
    'virtual_reserve_credit' : IDL.Nat,
    'operator' : IDL.Nat,
    'interfaces' : IDL.Nat,
    'gross' : IDL.Nat,
    'real_wallets' : IDL.Nat,
    'prize' : IDL.Nat,
    'charity' : IDL.Nat,
    'virtual_units' : IDL.Nat,
    'winners' : IDL.Nat,
  });
  const TourStatistics = IDL.Record({
    'first_time_paid_wallets' : IDL.Opt(IDL.Nat64),
    'retained_from_previous_tour' : IDL.Opt(IDL.Nat64),
    'returned_after_gap' : IDL.Opt(IDL.Nat64),
    'quote' : QuoteView,
    'owner_fund_units' : IDL.Nat,
    'roster_available' : IDL.Bool,
    'utc_day' : IDL.Nat64,
    'paid_wallets' : IDL.Nat64,
    'unique_paid_wallets_through_tour' : IDL.Opt(IDL.Nat64),
    'previous_utc_day' : IDL.Opt(IDL.Nat64),
    'cycle_id' : IDL.Nat64,
    'absent_since_previous_tour' : IDL.Opt(IDL.Nat64),
    'known_unique_wallets_lower_bound' : IDL.Nat64,
    'previous_cycle_id' : IDL.Opt(IDL.Nat64),
  });
  const StatisticsPage = IDL.Record({
    'next_after_cycle' : IDL.Opt(IDL.Nat64),
    'available_tours' : IDL.Nat64,
    'caught_up' : IDL.Bool,
    'indexed_through_cycle' : IDL.Nat64,
    'items' : IDL.Vec(TourStatistics),
  });
  const Result_135 = IDL.Variant({ 'Ok' : StatisticsPage, 'Err' : IDL.Text });
  const WalletRuntimeCapabilities = IDL.Record({
    'api_version' : IDL.Nat32,
    'source' : MoneySource,
    'account_links' : IDL.Bool,
    'wallet_read_sessions' : IDL.Opt(IDL.Bool),
    'deposits' : IDL.Bool,
    'photos' : IDL.Bool,
  });
  const Result_142 = IDL.Variant({
    'Ok' : WalletRuntimeCapabilities,
    'Err' : IDL.Text,
  });
  const TourSummaryView = IDL.Record({
    winners_count: IDL.Nat64,
    quote: QuoteView,
    owner_fund_units: IDL.Opt(IDL.Nat),
    roster_audit_available: IDL.Bool,
    random_words_count: IDL.Nat64,
    utc_day: IDL.Nat64,
    cycle_id: IDL.Nat64,
  });
  const PreparedDistributionView = IDL.Record({
    prize_micro_units: IDL.Nat,
    maximum_award_micro_units: IDL.Nat,
    gross_micro_units: IDL.Nat,
    utc_day: IDL.Nat64,
    cycle_id: IDL.Nat64,
    winners: IDL.Nat,
    minimum_award_micro_units: IDL.Nat,
  });
  const ForecastDistributionView = IDL.Record({
    method: IDL.Text,
    prize_micro_units: IDL.Nat,
    accounted_through_block: IDL.Opt(IDL.Nat),
    owner_fund_units: IDL.Nat,
    calculated_at_ns: IDL.Nat64,
    maximum_award_micro_units: IDL.Nat,
    gross_micro_units: IDL.Nat,
    utc_day: IDL.Nat64,
    real_wallets: IDL.Nat,
    virtual_units: IDL.Nat,
    winners: IDL.Nat,
    minimum_award_micro_units: IDL.Nat,
  });
  const DistributionSummaryView = IDL.Record({
    api_version: IDL.Nat32,
    prepared: IDL.Opt(PreparedDistributionView),
    forecast_unavailable: IDL.Opt(IDL.Text),
    forecast: IDL.Opt(ForecastDistributionView),
  });
  const DaySummaryView = IDL.Record({
    saved_random_chunks: IDL.Opt(IDL.Nat32),
    latest_tour: IDL.Opt(TourSummaryView),
    pending_utc_day: IDL.Opt(IDL.Nat64),
    distribution: IDL.Opt(DistributionSummaryView),
  });
  const Result_33 = IDL.Variant({
    Ok: DaySummaryView,
    Err: IDL.Text,
  });
  const Result_136 = IDL.Variant({
    Ok: TourSummaryView,
    Err: IDL.Text,
  });
  const TourPageView = IDL.Record({
    next_start: IDL.Opt(IDL.Nat64),
    total: IDL.Nat64,
    start: IDL.Nat64,
    items: IDL.Vec(IDL.Nat64),
    cycle_id: IDL.Nat64,
  });
  const Result_134 = IDL.Variant({
    Ok: TourPageView,
    Err: IDL.Text,
  });
  const WinnerView = IDL.Record({
    wallet_principal: IDL.Text,
    participant_index: IDL.Nat64,
    amount: IDL.Nat,
  });
  const TourPageView_1 = IDL.Record({
    next_start: IDL.Opt(IDL.Nat64),
    total: IDL.Nat64,
    start: IDL.Nat64,
    items: IDL.Vec(WinnerView),
    cycle_id: IDL.Nat64,
  });
  const Result_137 = IDL.Variant({
    Ok: TourPageView_1,
    Err: IDL.Text,
  });
  return IDL.Service({
    'arm_incoming_choice' : IDL.Func([IDL.Nat64], [Result_13], []),
    'arm_site_approval_choice' : IDL.Func([IDL.Nat64], [Result_14], []),
    'bond_approval_quote' : IDL.Func([], [Result_21], []),
    'choose_incoming_from_view' : IDL.Func(
        [IDL.Nat64, IncomingRequest, IDL.Nat],
        [Result_13],
        [],
      ),
    'choose_site_approval_from_view' : IDL.Func(
        [IDL.Nat64, IDL.Vec(IDL.Nat8), IDL.Nat, IDL.Nat],
        [Result_14],
        [],
      ),
    'choose_wallet_incoming_from_view' : IDL.Func(
        [IDL.Nat64, IncomingRequest, IDL.Nat],
        [Result_13],
        [],
      ),
    'confirm_incoming_block' : IDL.Func([IDL.Nat64, IDL.Nat], [Result_13], []),
    'income_payout_capabilities_v3' : IDL.Func([], [Result_41], ['query']),
    'income_payout_status_v3' : IDL.Func([IDL.Nat], [Result_42], ['query']),
    'interface_data_automation_status' : IDL.Func(
        [],
        [InterfaceDataAutomationStatus],
        ['query'],
      ),
    'interface_data_capabilities' : IDL.Func([], [Capabilities], ['query']),
    'interface_deposit_memo' : IDL.Func([IDL.Nat64], [Result_46], ['query']),
    'interface_info' : IDL.Func([IDL.Nat64], [Result_47], ['query']),
    'my_income_funds_v3' : IDL.Func([IncomeKindV3], [Result_57], ['query']),
    'my_incoming_choice' : IDL.Func([IDL.Nat64], [Result_58], ['query']),
    'my_incoming_status' : IDL.Func([], [Result_50], ['query']),
    'my_interface' : IDL.Func([], [Result_47], ['query']),
    'my_interface_bond' : IDL.Func([], [Result_59], ['query']),
    'my_interface_funds' : IDL.Func([], [Result_60], ['query']),
    'my_participant_wallet_funds' : IDL.Func([], [Result_70], ['query']),
    'my_payout_choice_v3' : IDL.Func([IDL.Nat64], [Result_71], ['query']),
    'my_site_approval_choice' : IDL.Func([IDL.Nat64], [Result_75], ['query']),
    'my_site_approval_status' : IDL.Func([], [Result_76], ['query']),
    'my_site_bond_context' : IDL.Func([], [Result_77], ['query']),
    'my_site_claim' : IDL.Func([], [Result_78], ['query']),
    'observe_incoming_choice' : IDL.Func(
        [IDL.Nat64, MoneyObservation],
        [Result_13],
        [],
      ),
    'observe_site_approval_choice' : IDL.Func(
        [IDL.Nat64, MoneyObservation],
        [Result_14],
        [],
      ),
    'observe_wallet_incoming_choice' : IDL.Func(
        [IDL.Nat64, IDL.Vec(IDL.Nat8), IDL.Vec(IDL.Nat8)],
        [Result_13],
        [],
      ),
    'project_statistics' : IDL.Func([], [Result_92], ['query']),
    'public_interface_deposits' : IDL.Func(
        [IDL.Nat64],
        [Result_104],
        ['query'],
      ),
    'public_prize_events' : IDL.Func(
        [IDL.Opt(PrizeCursor), IDL.Nat32],
        [Result_74],
        ['query'],
      ),
    'public_protocol_status' : IDL.Func([], [Result_112], ['query']),
    'request_income_payout_v3' : IDL.Func(
        [IDL.Nat64, IncomeInputV3, IDL.Nat],
        [Result_119],
        [],
      ),
    'request_site_claim_from_view' : IDL.Func(
        [IDL.Opt(IDL.Vec(IDL.Nat8)), IDL.Text, IDL.Principal],
        [Result_121],
        [],
      ),
    'scan_income_payout_v3' : IDL.Func([IDL.Nat, IDL.Nat32], [Result_124], []),
    'scan_incoming_choice' : IDL.Func([IDL.Nat64, IDL.Nat32], [Result_13], []),
    'scan_pending_interface_bond' : IDL.Func([IDL.Nat32], [Result_126], []),
    'scan_site_approval_choice' : IDL.Func(
        [IDL.Nat64, IDL.Nat32],
        [Result_14],
        [],
      ),
    'site_bond_action_from_view' : IDL.Func(
        [IDL.Nat64, IDL.Vec(IDL.Nat8), SiteBondAction],
        [Result_1],
        [],
      ),
    'current_tour_summary' : IDL.Func([], [Result_33], ['query']),
    'tour_summary' : IDL.Func([IDL.Nat64], [Result_136], ['query']),
    'tour_random_words_page' : IDL.Func([IDL.Nat64, IDL.Nat64, IDL.Nat32], [Result_134], ['query']),
    'tour_winners_page' : IDL.Func([IDL.Nat64, IDL.Nat64, IDL.Nat32], [Result_137], ['query']),
    'tour_statistics_page' : IDL.Func(
        [IDL.Opt(IDL.Nat64), IDL.Nat32],
        [Result_135],
        ['query'],
      ),
    'verify_site_claim_from_view' : IDL.Func(
        [IDL.Vec(IDL.Nat8), IDL.Opt(IDL.Nat64)],
        [Result_121],
        [],
      ),
    'wallet_runtime_capabilities' : IDL.Func([], [Result_142], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };

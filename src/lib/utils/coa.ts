import type { Account } from "../../api/endpoints/accounting";

/**
 * Strict picker filter for purchase-order payment source accounts.
 *
 * Restricts the dropdown to asset accounts whose code starts with `121` —
 * the chart's cash/bank/custodhip sub-tree (الأموال الجاهزة والنقدية). This
 * matches the seed at `database/seeders/ChartOfAccountsSeeder.php` and
 * prevents an operator from accidentally posting a payment against, say,
 * a fixed-asset sub-account.
 *
 * Returns accounts ordered as the chart presents them (parent-first is
 * already how `useAccounts` returns them).
 */
export function filterPaymentSourceAccounts(accounts: Account[]): Account[] {
  return leafAccounts(accounts).filter(
    (a) => a.type === "asset" && a.account_code.startsWith("121"),
  );
}

/**
 * Frozen itself or under a frozen ancestor (ACC-14) — the backend refuses
 * postings and new links to it.
 */
export function isFrozenAccount(account: Account, accounts: Account[]): boolean {
  const byId = new Map(accounts.map((a) => [a.id, a]));
  const seen = new Set<string>();
  let current: Account | undefined = account;
  while (current && !seen.has(current.id)) {
    if (current.status === "frozen") return true;
    seen.add(current.id);
    current = current.parent_account_id ? byId.get(current.parent_account_id) : undefined;
  }
  return false;
}

/**
 * Accounts that can take a posting or a link: active accounts with no
 * sub-accounts. The backend refuses headers (BR-GL-001) and frozen accounts
 * (ACC-14), so pickers should not offer them.
 * `allowedHeaderCodes` keeps specific headers selectable (the receivable root
 * 122 takes client-tagged manual lines by design). `keepIds` keeps an
 * already-linked account visible even if it has since been frozen, so an
 * existing form still shows what it holds.
 */
export function leafAccounts(
  accounts: Account[],
  allowedHeaderCodes: string[] = [],
  keepIds: (string | null | undefined)[] = [],
): Account[] {
  const parents = new Set(accounts.map((a) => a.parent_account_id).filter(Boolean));
  const keep = new Set(keepIds.filter(Boolean));
  return accounts.filter(
    (a) =>
      (!parents.has(a.id) || allowedHeaderCodes.includes(a.account_code)) &&
      (keep.has(a.id) || !isFrozenAccount(a, accounts)),
  );
}

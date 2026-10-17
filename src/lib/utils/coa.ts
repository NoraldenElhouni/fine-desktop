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
 * Accounts that can take a posting or a link: those with no sub-accounts.
 * The backend refuses headers (BR-GL-001), so pickers should not offer them.
 * `allowedHeaderCodes` keeps specific headers selectable (the receivable root
 * 122 takes client-tagged manual lines by design).
 */
export function leafAccounts(accounts: Account[], allowedHeaderCodes: string[] = []): Account[] {
  const parents = new Set(accounts.map((a) => a.parent_account_id).filter(Boolean));
  return accounts.filter(
    (a) => !parents.has(a.id) || allowedHeaderCodes.includes(a.account_code),
  );
}

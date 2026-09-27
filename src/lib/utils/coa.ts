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
  return accounts.filter(
    (a) => a.type === "asset" && a.account_code.startsWith("121"),
  );
}

;; Playground Coin (PLAY) - SIP-010 Fungible Token
;; Decimals: 6, Name: "Playground Coin", Symbol: "PLAY"
;; Fitur: claim-tokens (faucet) hanya boleh 1x per 10 block per user.

;; Implement SIP-010 Trait
(impl-trait .sip-010-trait.sip-010-ft-trait)

;; Error codes
(define-constant ERR-UNAUTHORIZED (err u101))
(define-constant ERR-INSUFFICIENT (err u100))
(define-constant ERR-COOLDOWN (err u200))
(define-constant ERR-INVALID-AMOUNT (err u103))
(define-constant ERR-SAME (err u104))
(define-constant ERR-SUPPLY (err u300))

;; Metadata konstanta (ASCII strings)
(define-constant TOKEN-NAME "Playground Coin")
(define-constant TOKEN-SYMBOL "PLAY")
(define-constant TOKEN-DECIMALS u6)
(define-constant MAX-SUPPLY u100000000000000) ;; batas suplai opsional

;; Faucet config
(define-constant FAUCET-AMOUNT u100000000) ;; 100 PLAY * 1_000_000 (decimals=6)
(define-constant COOLDOWN-BLOCKS u10)

;; Penyimpanan saldo & total suplai
(define-map balances {account: principal} {amount: uint})
(define-data-var total-supply uint u0)

;; Map untuk mencatat block terakhir klaim faucet
(define-map last-claimed {account: principal} {height: uint})

;; SIP-010 getters (response wrapped in ok)
(define-read-only (get-name)
  (ok TOKEN-NAME))

(define-read-only (get-symbol)
  (ok TOKEN-SYMBOL))

(define-read-only (get-decimals)
  (ok TOKEN-DECIMALS))

(define-read-only (get-total-supply)
  (ok (var-get total-supply)))

(define-read-only (get-balance (owner principal))
  (ok (default-to u0 (get amount (map-get? balances {account: owner})))))

(define-read-only (get-token-uri)
  (ok (some "https://playground-token.example/metadata.json")))

;; Internal: tambah saldo
(define-private (add-balance (who principal) (amt uint))
  (let ((current (default-to u0 (get amount (map-get? balances {account: who})))))
    (map-set balances {account: who} {amount: (+ current amt)})))

;; Internal: kurangi saldo, fail bila kurang
(define-private (sub-balance (who principal) (amt uint))
  (let ((current (default-to u0 (get amount (map-get? balances {account: who})))))
    (if (>= current amt)
        (begin
          (map-set balances {account: who} {amount: (- current amt)})
          (ok true))
        ERR-INSUFFICIENT))) ;; u100: insufficient balance

;; SIP-010 transfer
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-UNAUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (not (is-eq sender recipient)) ERR-SAME)
    (try! (sub-balance sender amount))
    (add-balance recipient amount)
    ;; Event transfer FT
    (print {type: "ft_transfer", sender: sender, recipient: recipient, amount: amount, memo: memo})
    (ok true)))

;; Faucet: 1x per 10 block
(define-public (claim-tokens)
  (let
      (
        (caller tx-sender)
        (now block-height)
        (last-claim (map-get? last-claimed {account: caller}))
      )
    (match last-claim
      last-data
        (if (>= (- now (get height last-data)) COOLDOWN-BLOCKS)
            (let ((new-supply (+ (var-get total-supply) FAUCET-AMOUNT)))
              (asserts! (<= new-supply MAX-SUPPLY) ERR-SUPPLY)
              (add-balance caller FAUCET-AMOUNT)
              (var-set total-supply new-supply)
              (map-set last-claimed {account: caller} {height: now})
              (print {type: "ft_mint", recipient: caller, amount: FAUCET-AMOUNT})
              (ok true))
            ERR-COOLDOWN) ;; u200: cooldown not passed
      ;; First time claim, no record exists
      (begin
        (let ((new-supply (+ (var-get total-supply) FAUCET-AMOUNT)))
          (asserts! (<= new-supply MAX-SUPPLY) ERR-SUPPLY)
          (add-balance caller FAUCET-AMOUNT)
          (var-set total-supply new-supply)
          (map-set last-claimed {account: caller} {height: now})
          (print {type: "ft_mint", recipient: caller, amount: FAUCET-AMOUNT})
          (ok true))))))

;; Mint internal (untuk extensibility; tidak dipakai publik selain faucet)
(define-private (mint (to principal) (amt uint))
  (begin
    (add-balance to amt)
    (var-set total-supply (+ (var-get total-supply) amt))
    (ok true)))
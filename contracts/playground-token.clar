;; Playground Coin (PLAY) - SIP-010 Fungible Token
;; Decimals: 6, Name: "Playground Coin", Symbol: "PLAY"
;; Fitur: claim-tokens (faucet) hanya boleh 1x per 10 block per user.
;; Compatible with Clarity v4

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
(define-constant MAX-SUPPLY u100000000000000) ;; batas suplai

;; Faucet config
(define-constant FAUCET-AMOUNT u100000000) ;; 100 PLAY * 1_000_000 (decimals=6)
(define-constant COOLDOWN-BLOCKS u10) ;; 10 block cooldown

;; Penyimpanan saldo & total suplai
(define-map balances {account: principal} {amount: uint})
(define-data-var total-supply uint u0)

;; COOLDOWN TRACKING - block-height IS SUPPORTED in Clarity v4
(define-map last-claim-block {user: principal} {block: uint})

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

;; Helper: cek apakah user bisa claim
(define-read-only (can-claim (user principal))
  (let ((last-block (default-to u0 (get block (map-get? last-claim-block {user: user})))))
    (>= (- block-height last-block) COOLDOWN-BLOCKS)))

;; Helper: dapatkan sisa blocks hingga bisa claim lagi
(define-read-only (blocks-until-claim (user principal))
  (let ((last-block (default-to u0 (get block (map-get? last-claim-block {user: user})))))
    (if (>= (- block-height last-block) COOLDOWN-BLOCKS)
        u0
        (- COOLDOWN-BLOCKS (- block-height last-block)))))

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
        ERR-INSUFFICIENT)))

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

;; Faucet: mint dengan cooldown dan supply cap
(define-public (claim-tokens)
  (let (
        (caller tx-sender)
        (new-supply (+ (var-get total-supply) FAUCET-AMOUNT))
        (last-block (default-to u0 (get block (map-get? last-claim-block {user: caller}))))
       )
    ;; Check cooldown - block-height IS available in Clarity v4
    (asserts! (>= (- block-height last-block) COOLDOWN-BLOCKS) ERR-COOLDOWN)
    ;; Check supply cap
    (asserts! (<= new-supply MAX-SUPPLY) ERR-SUPPLY)
    
    ;; Update state (CEI pattern)
    (map-set last-claim-block {user: caller} {block: block-height})
    (add-balance caller FAUCET-AMOUNT)
    (var-set total-supply new-supply)
    
    ;; Event
    (print {type: "ft_mint", recipient: caller, amount: FAUCET-AMOUNT, block: block-height})
    (ok true)))

;; Mint internal (untuk extensibility)
(define-private (mint (to principal) (amt uint))
  (begin
    (add-balance to amt)
    (var-set total-supply (+ (var-get total-supply) amt))
    (ok true)))
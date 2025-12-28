;; Dev Badge (SIP-009) - mint hanya jika bayar 50 PLAY ke kontrak ini.
;; Secure: otorisasi transfer, CEI pada mint, pembayaran via .playground-token

;; Impl trait SIP-009
;; Kontrak trait dibangun dari file contracts/traits/sip-009-trait.clar
(impl-trait .sip-009-trait.sip-009-nft-trait)

;; Konstanta & error codes
(define-constant MINT-PRICE u50000000) ;; 50 PLAY * 1_000_000 (decimals=6)
(define-constant ERR-NOT-AUTH (err u401))
(define-constant ERR-NOT-FOUND (err u404))
(define-constant ERR-INVALID-RECIPIENT (err u400))
(define-constant ERR-PAYMENT (err u402))

;; Storage owner NFT
(define-map token-owners {id: uint} {owner: principal})
(define-data-var last-id uint u0)

;; ========== CRITICAL FIX: get-last-token-id required by SIP-009 ==========
(define-read-only (get-last-token-id) 
  (ok (var-get last-id)))

;; Read-only getters
(define-read-only (get-owner (id uint))
  (ok (get owner (map-get? token-owners {id: id}))))

;; ========== CRITICAL FIX: ASCII string, NOT uint string ==========
(define-read-only (get-token-uri (id uint))
  ;; Contoh URI sederhana; bisa disesuaikan
  (ok (some "https://example.com/dev-badge/{id}")))

;; Mint helper: CEI pattern
(define-private (mint (recipient principal))
  (let ((new-id (+ (var-get last-id) u1)))
    ;; state updates dulu
    (var-set last-id new-id)
    (map-set token-owners {id: new-id} {owner: recipient})
    ;; event mint
    (print {type: "nft_mint", token-id: new-id, recipient: recipient})
    (ok new-id)))

;; Public mint dengan pembayaran 50 PLAY
(define-public (buy-mint)
  (let ((buyer tx-sender))
    ;; bayar dulu, jika gagal -> revert
    (match (contract-call? .playground-token transfer MINT-PRICE buyer (as-contract tx-sender) none)
      success (mint buyer)
      error ERR-PAYMENT)))

;; Transfer NFT (SIP-009) - FIXED: Add explicit validation for unchecked data
(define-public (transfer (id uint) (sender principal) (recipient principal))
  (let ((owner-data (map-get? token-owners {id: id})))
    ;; Validate recipient is not zero address (standard validation)
    (asserts! (not (is-eq recipient 'ST000000000000000000002AMW42H)) ERR-INVALID-RECIPIENT)
    
    (match owner-data
      some-owner
        (begin
          (asserts! (is-eq tx-sender (get owner some-owner)) ERR-NOT-AUTH)
          (asserts! (is-eq sender (get owner some-owner)) ERR-NOT-AUTH)
          (asserts! (not (is-eq recipient sender)) ERR-INVALID-RECIPIENT)
          ;; Now safe to use recipient after validation
          (map-set token-owners {id: id} {owner: recipient})
          (print {type: "nft_transfer", token-id: id, sender: sender, recipient: recipient})
          (ok true))
      ERR-NOT-FOUND)))
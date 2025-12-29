;; Dev Badge (SIP-009)
;; Sistem: Pay-to-Mint (Bayar 50 PLAY untuk dapat NFT)

;; Impl trait SIP-009
(impl-trait .sip-009-trait.sip-009-nft-trait)

;; Konstanta & error codes
(define-constant MINT-PRICE u50000000) ;; 50 PLAY (decimals=6)
(define-constant ERR-NOT-AUTH (err u401))
(define-constant ERR-NOT-FOUND (err u404))
(define-constant ERR-INVALID-RECIPIENT (err u400))
(define-constant ERR-PAYMENT (err u402))
(define-constant ERR-ALREADY-MINTED (err u403))

;; Storage
(define-map token-owners {id: uint} {owner: principal})
(define-data-var last-id uint u0)
(define-map has-minted {user: principal} {minted: bool})

;; ========== SIP-009 Required Functions ==========
(define-read-only (get-last-token-id) 
  (ok (var-get last-id)))

(define-read-only (get-owner (id uint))
  (ok (get owner (map-get? token-owners {id: id}))))

(define-read-only (get-token-uri (id uint))
  (ok (some "https://deranalabs.github.io/Stacks-challenge/ui/public/metadata.json")))

;; ========== Read-only Helpers ==========
(define-read-only (has-user-minted (user principal))
  (default-to false (get minted (map-get? has-minted {user: user}))))

;; ========== Internal Helpers ==========

(define-private (mint-internal (recipient principal))
  (let ((new-id (+ (var-get last-id) u1)))
    (var-set last-id new-id)
    (map-set token-owners {id: new-id} {owner: recipient})
    (map-set has-minted {user: recipient} {minted: true})
    (print {type: "nft_mint", token-id: new-id, recipient: recipient})
    (ok new-id)))

;; ========== Public Functions ==========

;; Buy mint: Fungsi utama untuk membeli NFT
;; Secara otomatis menarik 50 PLAY dari wallet user
(define-public (buy-mint)
  (let (
    (buyer tx-sender)
    ;; Uang (Token) akan masuk ke kontrak ini
    (recipient (as-contract tx-sender)) 
  )
    ;; 1. Cek User belum pernah mint
    (asserts! (not (has-user-minted buyer)) ERR-ALREADY-MINTED)

    ;; 2. TARIK PEMBAYARAN (Atomic Swap)
    ;; Memanggil kontrak playground-token untuk transfer
    (try! (contract-call? .playground-token transfer 
            MINT-PRICE      
            buyer           
            recipient       
            none            
    ))

    ;; 3. Mint NFT jika pembayaran sukses
    (mint-internal buyer)
  )
)

;; Transfer NFT (SIP-009 Standard)
(define-public (transfer (id uint) (sender principal) (recipient principal))
  (let ((owner-data (map-get? token-owners {id: id})))
    ;; Mencegah transfer ke burn address (opsional tapi bagus)
    (asserts! (not (is-eq recipient 'ST000000000000000000002AMW42H)) ERR-INVALID-RECIPIENT)
    
    (match owner-data
      some-owner
        (begin
          ;; Verifikasi pemilik
          (asserts! (is-eq tx-sender (get owner some-owner)) ERR-NOT-AUTH)
          (asserts! (is-eq sender (get owner some-owner)) ERR-NOT-AUTH)
          (asserts! (not (is-eq recipient sender)) ERR-INVALID-RECIPIENT)
          
          ;; Update pemilik baru
          (map-set token-owners {id: id} {owner: recipient})
          (print {type: "nft_transfer", token-id: id, sender: sender, recipient: recipient})
          (ok true))
      ERR-NOT-FOUND)))
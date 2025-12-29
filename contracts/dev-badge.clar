;; Dev Badge (SIP-009)
;; Pay-to-Mint System: Pay 50 PLAY tokens to get NFT

;; Implement SIP-009 trait
(impl-trait .sip-009-trait.sip-009-nft-trait)

;; Constants & error codes
(define-constant MINT-PRICE u50000000) ;; 50 PLAY (decimals=6)
(define-constant ERR-NOT-AUTH (err u401))
(define-constant ERR-NOT-FOUND (err u404))
(define-constant ERR-INVALID-RECIPIENT (err u400))
(define-constant ERR-PAYMENT (err u402))
(define-constant ERR-ALREADY-MINTED (err u403))

;; Deployer constant (to receive payments)
(define-constant CONTRACT-OWNER tx-sender)

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

;; Mint helper: CEI pattern
(define-private (mint-internal (recipient principal))
  (let ((new-id (+ (var-get last-id) u1)))
    (var-set last-id new-id)
    (map-set token-owners {id: new-id} {owner: recipient})
    (map-set has-minted {user: recipient} {minted: true})
    (print {type: "nft_mint", token-id: new-id, recipient: recipient})
    (ok new-id)))

;; ========== Public Functions ==========

;; Buy mint: Main function to purchase NFT
;; Automatically pulls 50 PLAY from user wallet to CONTRACT-OWNER
(define-public (buy-mint)
  (let (
    (buyer tx-sender)
  )
    ;; 1. Check if user hasn't minted before
    (asserts! (not (has-user-minted buyer)) ERR-ALREADY-MINTED)

    ;; 2. PULL PAYMENT (Atomic Swap)
    ;; Call playground-token-v2 contract to transfer
    ;; Money sent to CONTRACT-OWNER (not to this contract)
    ;; FIX: Mengarah ke .playground-token-v2
    (try! (contract-call? .playground-token-v2 transfer 
            MINT-PRICE      
            buyer           
            CONTRACT-OWNER          
            none            
    ))

    ;; 3. Mint NFT if payment successful
    (mint-internal buyer)
  )
)

;; Transfer NFT (SIP-009 Standard)
(define-public (transfer (id uint) (sender principal) (recipient principal))
  (let ((owner-data (map-get? token-owners {id: id})))
    ;; Prevent transfer to burn address
    (asserts! (not (is-eq recipient 'ST000000000000000000002AMW42H)) ERR-INVALID-RECIPIENT)
    
    (match owner-data
      some-owner
        (begin
          ;; Verify ownership
          (asserts! (is-eq tx-sender (get owner some-owner)) ERR-NOT-AUTH)
          (asserts! (is-eq sender (get owner some-owner)) ERR-NOT-AUTH)
          (asserts! (not (is-eq recipient sender)) ERR-INVALID-RECIPIENT)
          
          ;; Update new owner
          (map-set token-owners {id: id} {owner: recipient})
          (print {type: "nft_transfer", token-id: id, sender: sender, recipient: recipient})
          (ok true))
      ERR-NOT-FOUND)))
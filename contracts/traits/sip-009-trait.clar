;; SIP-009 Non-Fungible Token Trait (standard)
;; Reference: https://github.com/stacksgov/sips/blob/main/sips/sip-009/sip-009-nft-standard.md

(define-trait sip-009-nft-trait
  (
    (transfer (uint principal principal) (response bool uint))
    (get-owner (uint) (response (optional principal) uint))
    (get-token-uri (uint) (response (optional (string-ascii 256)) uint))
  ))
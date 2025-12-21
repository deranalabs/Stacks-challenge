;; Kontrak: hello-world
;; Menyimpan pemilik dan timestamp blok terakhir ketika pemilik diganti (Clarity 4 stacks-block-time)
(define-data-var owner principal tx-sender)
(define-data-var last-updated uint u0)

(define-read-only (get-owner)
  (ok (var-get owner)))

(define-read-only (get-last-updated)
  (ok (var-get last-updated)))

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) (err u403))
    (var-set owner new-owner)
    (var-set last-updated (stacks-block-time))
    (ok
      {
        owner: (var-get owner),
        last-updated: (var-get last-updated)
      })
  ))
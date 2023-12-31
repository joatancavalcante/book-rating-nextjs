import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

import { api } from '@/lib/axios'
import * as Dialog from '@radix-ui/react-dialog'

import { Avatar } from '@/components/Avatar'
import { Card } from '@/components/Card'
import { Comment, RatingType } from '@/components/Comment'
import { RatingButton } from '@/components/Rating/Button'
import { SignInModal } from '../SignInModal'

import { BookOpen, BookmarkSimple, Check, X } from '@phosphor-icons/react'

import {
  Content,
  Overlay,
  BookDetails,
  BookAbout,
  AboutItem,
  Ratings,
  CloseButton,
  ReviewBox,
  ReviewActions,
  ReviewForm,
  ReviewHeader,
  CancelButton,
  SaveButton,
} from './styles'

type BookType = {
  id: string
  name: string
  imageUrl: string
  author: string
  categories: Array<string>
  average: number
  totalPages: number
}

interface BookModalProps {
  open: boolean
  book: BookType
  onOpenChange: (open: boolean) => void
}

export function BookModal({ book, onOpenChange, open }: BookModalProps) {
  const { data, status } = useSession()

  const [ratings, setRatings] = useState<RatingType[]>([] as RatingType[])

  const [isReviewFieldVisible, setIsReviewFieldVisible] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [rateAboutBook, setRateAboutBook] = useState(0)

  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)

  useEffect(() => {
    async function loadRatingsInfo(bookId: string) {
      const { ratings } = await api
        .get(`/ratings/book/${bookId}`)
        .then((res) => res.data)

      setRatings(ratings)
    }

    if (book) {
      loadRatingsInfo(book.id)
    }
  }, [book])

  async function handleReviewBookOrSignIn() {
    if (status === 'authenticated') {
      const review = {
        description: reviewText,
        rate: rateAboutBook,
        book_id: book.id,
      }
      await api
        .post(`/users/${data.user.id}/rating`, { data: review })
        .then((_) => {
          handleCloseForm()
        })
    }
  }

  function handleCloseForm() {
    setIsReviewFieldVisible(false)
    setReviewText('')
    setRateAboutBook(0)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Overlay />

      <Content>
        <CloseButton>
          <X size={24} weight="bold" />
        </CloseButton>

        <BookDetails>
          <Card
            author={book.author}
            image={{ url: book.imageUrl, height: 242, width: 170 }}
            name={book.name}
            rating={book.average}
            amountRatings={ratings.length}
            disabled
          />

          <BookAbout>
            <AboutItem>
              <BookmarkSimple size={24} weight="bold" />
              <div>
                <span>Categoria</span>
                <strong>Educação</strong>
              </div>
            </AboutItem>

            <AboutItem>
              <BookOpen size={24} weight="bold" />
              <div>
                <span>Páginas</span>
                <strong>{book.totalPages}</strong>
              </div>
            </AboutItem>
          </BookAbout>
        </BookDetails>

        <Ratings>
          <header>
            <span>Avaliações</span>
            {!isReviewFieldVisible && (
              <button
                onClick={() =>
                  status === 'unauthenticated'
                    ? setIsSignInModalOpen(true)
                    : setIsReviewFieldVisible(true)
                }
              >
                Avaliar
              </button>
            )}
          </header>

          {isReviewFieldVisible && (
            <ReviewBox>
              <ReviewHeader>
                <Avatar
                  avatarUrl={data?.user.avatar_url}
                  username={data?.user.name}
                />
                <strong>{data?.user.name}</strong>

                <RatingButton
                  rating={0}
                  sizeIcons={28}
                  onRating={(rate) => setRateAboutBook(rate)}
                />
              </ReviewHeader>

              <ReviewForm>
                <textarea
                  name="review"
                  id="review"
                  placeholder="Escreva sua avaliação"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  maxLength={450}
                />
                <span>{reviewText.length}/450</span>
              </ReviewForm>

              <ReviewActions>
                <CancelButton onClick={handleCloseForm}>
                  <X size={24} weight="bold" />
                </CancelButton>
                <SaveButton
                  onClick={() => handleReviewBookOrSignIn(reviewText)}
                >
                  <Check size={24} weight="bold" />
                </SaveButton>
              </ReviewActions>
            </ReviewBox>
          )}

          {ratings.length !== 0 &&
            ratings.map((rating) => (
              <Comment key={rating.id} rating={rating} />
            ))}
        </Ratings>
      </Content>
      {isSignInModalOpen && (
        <SignInModal
          open={isSignInModalOpen}
          onOpenChange={setIsSignInModalOpen}
        />
      )}
    </Dialog.Root>
  )
}

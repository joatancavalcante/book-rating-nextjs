// http://localhost:3000/api/book?bookId=0440ad7d-230e-4573-b455-84ca38b5d339

import { NextApiRequest, NextApiResponse } from 'next'

import { prisma } from '@/lib/prisma'
import { calculateAverage } from '@/utils/calculateAverage'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405)
  }

  const results = await prisma.$transaction([
    prisma.book.count(),
    prisma.book.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        categories: {
          select: {
            category: true,
          },
        },
        ratings: {
          select: {
            id: true,
            rate: true,
            user_id: true,
          },
        },
      },
    }),
  ])

  const total = results[0] ?? 0
  const books = results[1].map((book) => {
    const { average } = calculateAverage(book.ratings.map((rate) => rate.rate))

    return {
      author: book.author,
      id: book.id,
      name: book.name,
      imageUrl: book.cover_url,
      categories: book.categories.map((category) => category.category.name),
      average: Number(average),
      totalPages: book.total_pages,
      ratings: book.ratings.map((rating) => {
        return {
          id: rating.id,
          rating: rating.rate,
          userId: rating.user_id,
        }
      }),
    }
  })

  return res.json({ total, books })
}
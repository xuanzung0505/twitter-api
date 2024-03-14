/**
 * This aggregation pipeline retreive additional tweet data
 */
export const TweetAdditionalData = [
  {
    $lookup: {
      from: 'users',
      localField: 'user_id',
      foreignField: '_id',
      as: 'user',
      pipeline: [
        {
          $project: {
            name: 1,
            username: 1,
            avatar: 1
          }
        }
      ]
    }
  },
  {
    $unwind: {
      path: '$user'
    }
  },
  {
    $lookup: {
      from: 'hashtags',
      localField: 'hashtags',
      foreignField: '_id',
      as: 'hashtags',
      pipeline: [
        {
          $project: {
            name: 1
          }
        }
      ]
    }
  },
  {
    $lookup: {
      from: 'users',
      localField: 'mentions',
      foreignField: '_id',
      as: 'mentions',
      pipeline: [
        {
          $project: {
            name: 1,
            username: 1
          }
        }
      ]
    }
  },
  {
    $lookup: {
      from: 'likes',
      localField: '_id',
      foreignField: 'tweet_id',
      as: 'total_likes'
    }
  },
  {
    $addFields: {
      total_likes: {
        $size: '$total_likes'
      }
    }
  },
  {
    $lookup: {
      from: 'bookmarks',
      localField: '_id',
      foreignField: 'tweet_id',
      as: 'total_bookmarks'
    }
  },
  {
    $addFields: {
      total_bookmarks: {
        $size: '$total_bookmarks'
      }
    }
  },
  {
    $lookup: {
      from: 'tweets',
      let: {
        local_parent_id: '$_id'
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ['$$local_parent_id', '$parent_id']
                },
                {
                  $eq: ['$type', 1]
                }
              ]
            }
          }
        }
      ],
      as: 'total_retweets'
    }
  },
  {
    $addFields: {
      total_retweets: {
        $size: '$total_retweets'
      }
    }
  },
  {
    $lookup: {
      from: 'tweets',
      let: {
        local_parent_id: '$_id'
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ['$$local_parent_id', '$parent_id']
                },
                {
                  $eq: ['$type', 2]
                }
              ]
            }
          }
        }
      ],
      as: 'total_quotes'
    }
  },
  {
    $addFields: {
      total_quotes: {
        $size: '$total_quotes'
      }
    }
  },
  {
    $lookup: {
      from: 'tweets',
      let: {
        local_parent_id: '$_id'
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ['$$local_parent_id', '$parent_id']
                },
                {
                  $eq: ['$type', 3]
                }
              ]
            }
          }
        }
      ],
      as: 'total_comments'
    }
  },
  {
    $addFields: {
      total_comments: {
        $size: '$total_comments'
      }
    }
  }
]

export const TweetPaginationWithAdditionalData = (limit: number, page: number, additionalPipelines?: any[]) => [
  {
    $facet: {
      metadata: [
        {
          $count: 'totalDocs'
        }
      ],
      data: [
        {
          $skip: ((page as number) - 1) * (limit as number)
        },
        {
          $limit: limit
        },
        ...(additionalPipelines ?? []),
        ...TweetAdditionalData
      ]
    }
  },
  {
    $unwind: {
      path: '$metadata'
    }
  }
]

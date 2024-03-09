import { getGigById, searchGigs } from '@authentication/services/search.service';
import { IPaginateProps, ISearchResult, ISellerGig } from '@mohamedramadan14/freelance-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sortBy } from 'lodash';

export const gigsSearch = async (req: Request, res: Response): Promise<void> => {
  const { from, size, type } = req.params;

  let resultHits: unknown[] = [];

  const paginate: IPaginateProps = {
    from,
    size: parseInt(`${size}`),
    type
  };

  const gigs: ISearchResult = await searchGigs(
    `${req.query.query}`,
    paginate,
    `${req.query.delivery_time}`,
    parseInt(`${req.query.minPrice}`),
    parseInt(`${req.query.maxPrice}`)
  );

  gigs.hits.forEach((gig) => {
    resultHits.push(gig._source);
  });

  if (type === 'backward') {
    resultHits = sortBy(resultHits, ['sortId']);
  }

  res.status(StatusCodes.OK).json({
    message: 'gigs searching results',
    total: gigs.total,
    gigs: resultHits
  });
};

export const searchGigById = async (req: Request, res: Response): Promise<void> => {
  const { gigId } = req.params;
  const gig: ISellerGig = await getGigById('gigs', `${gigId}`);
  res.status(StatusCodes.OK).json({
    message: 'single gig searching result',
    gig
  });
};

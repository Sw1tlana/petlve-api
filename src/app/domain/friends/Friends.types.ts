export interface IFriends {
    id: string;
    title: string;
    url: string;
    addressUrl: string;
    imageUrl: string;
    address: string;
    workDays: [
      {
        id: string;
        isOpen: boolean;
        from?: string;
        to?: string;
      },
      {
        _id: string;
        isOpen: boolean;
      },
      {
        _id: string;
        isOpen: boolean;
      },
      {
        _id: string;
        isOpen: boolean;
      },
      {
        _id: string;
        isOpen: boolean;
      },
      {
        _id: string;
        isOpen: boolean;
        from?: string;
        to?: string;
      },
      {
        _id: string;
        isOpen: boolean;
        from?: string;
        to?: string;
      }
    ];
    phone: string;
    email: string;
  }
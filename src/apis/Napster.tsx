import axios from 'axios';

interface IPlaylistsResult {
    playlist: IPlayList[];
}

interface IPlayList {
    type: string;
    id: string;
    name: string;
    modified: Date;
    href: string;
    privacy: string;
    images: IImage[];
    description: string;
    favoriteCount: number;
    freePlayCompliant: true;
}

interface IImage {
    imageId: string;
    contentId: string;
    url: string
    defaultImage: boolean;
    imageType: string;
    version: number;
}

class NapsterApi {
    public getTopPlayerlists() {
        axios.get<IPlaylistsResult>('https://api.napster.com/v2.0/playlists?apikey=ZTk2YjY4MjMtMDAzYy00MTg4LWE2MjYtZDIzNjJmMmM0YTdm')
            .then(response  => console.log(response));
    }
}

export default NapsterApi;
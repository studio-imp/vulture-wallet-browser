import axios from 'axios';
import { TokenTypes } from '../types/tokenTypes';


export interface ERC721Metadata {
    name: string,
    image: string,
    description: string,
    external_url: string,
    attributes: []
}

/** ## fetchMetadata()
 * Due to the fact that metadata URIs may be https://, or ipfs://
 * we need to make sure we can retrieve the data in both cases.
 * 
 * This function will automatically parse the URIs, as well as 
 * attempt to retrieve the data.
 */
export async function fetchMetadata(URI: string, expectedMetadataFormat: TokenTypes): Promise<ERC721Metadata | any | null> {

    if(URI.indexOf("http://") == 0 || URI.indexOf("https://") == 0) {
        if(URI.endsWith('.json')) {
            switch(expectedMetadataFormat) {
                case TokenTypes.ERC721: {
                    return await (await axios.get(URI)).data as ERC721Metadata;

                }
                default: {
                    console.warn("The token type: " + expectedMetadataFormat + " doesn't have a metadata format in vulture!");
                    return await (await axios.get(URI)).data;
                }
            }
        }else {
            console.error("Metadata URI currently has to link to a JSON file!");
        }
    }else if(URI.indexOf("ipfs://") == 0) {
        console.warn("IPFS not currently supported! (Just wait a smol bit :D)... It might be broken.");
        return await (await axios.get('https://ipfs.io/ipfs/' + URI.replace('ipfs://', '')))
    }
    return null;
}


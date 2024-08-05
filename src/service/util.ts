const strBaseURL = 'http://pe-api.test/?click_history=165dde2af0dd4b589e3a3c8e26f0da86'
/**
 * Emulate phpGW's link function
 *
 * @param String strURL target URL
 * @param Object oArgs Query String args as associate array object
 * @param bool bAsJSON ask that the request be returned as JSON (experimental feature)
 * @param String baseURL (optional) Base URL to use instead of strBaseURL
 * @returns String URL
 */
export function phpGWLink(strURL: string, oArgs: Record<string, string|number|string[]> | null, bAsJSON: boolean = true, baseURL?: string): string {
    // console.log(strBaseURL)
    if (baseURL) {
        const baseURLParts = (baseURL).split('/').filter(a => a !== '' && !a.includes('http'));
        baseURL = '//' + baseURLParts.slice(0, baseURLParts.length - 1).join('/') + '/'; // Remove last element (file name)
    }
    const urlParts = (baseURL || strBaseURL).split('?');
    let newURL = urlParts[0] + strURL + '?';

    if (oArgs == null) {
        oArgs = {};
    }
    for (const key in oArgs) {
        newURL += key + '=' + oArgs[key] + '&';
    }
    if (urlParts[1]) {
        newURL += urlParts[1];
    }

    if (bAsJSON) {
        newURL += '&phpgw_return_as=json';
    }
    return newURL;
}

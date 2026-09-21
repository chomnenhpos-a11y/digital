import {useContext, createContext, useState} from "react"

const SearchContext = createContext()
export function SearchProvider({children}){
    const [searchItem, setSearchItem] = useState("");
    const [priceRange, setPriceRange] = useState("all");
    return(
        <SearchContext.Provider
         value={{searchItem, setSearchItem, priceRange, setPriceRange}}>
        {children}
        </SearchContext.Provider>
    )
}
export function useSearch(){
    return useContext(SearchContext);
}
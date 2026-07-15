export default function SearchBar({search,setSearch}){
    return(
        <input

        type = "text"
        placeholder="search Products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}

        />
    );
}
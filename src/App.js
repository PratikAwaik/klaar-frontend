import React, { useEffect, useState } from "react";
import Pagination from "react-js-pagination";
import { getIndex } from "./utils";

function App() {
  const [bankData, setBankData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOption, setDropdownOption] = useState("Mumbai");
  const [searchValue, setSearchValue] = useState("");
  const [activePageNumber, setActivePageNumber] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentResults, setCurrentResults] = useState([]);
  const [viewFavourite, setViewFavourite] = useState(false);

  useEffect(() => {
    (async () => {
      // cache the api call
      if (localStorage.getItem("bankData")) {
        const data = JSON.parse(localStorage.getItem("bankData"));
        setBankData(data);
        setSearchResults(data);
        setCurrentResults(data.slice(0, 10));
      } else {
        const response = await fetch(
          "https://vast-shore-74260.herokuapp.com/banks?city=MUMBAI",
        );
        const data = await response.json();
        data.forEach((bank) => (bank["favourite"] = false));
        localStorage.setItem("bankData", JSON.stringify(data));
        setBankData(data);
        setSearchResults(data);
        setCurrentResults(data.slice(0, 10));
      }
      setLoading(false);
    })();
  }, []);

  const handleDropdownChange = (e) => {
    const { value } = e.target;
    const newBankData = bankData.filter(
      (bank) => bank.city.toLowerCase() === value,
    );
    setSearchResults(newBankData);
    setCurrentResults(newBankData.slice(0, itemsPerPage));
    setDropdownOption(value);
  };

  const handleTextChange = (e) => {
    const { value } = e.target;
    setSearchValue(value);
    const newBankData = bankData.filter((bank) => {
      let found = false;
      Object.keys(bank).forEach((key) => {
        if (bank[key].toString().toLowerCase().includes(value.toLowerCase()))
          found = true;
      });
      return found;
    });
    setSearchResults(newBankData);
    setCurrentResults(newBankData.slice(0, itemsPerPage));
  };

  const setFavourites = () => {
    const favourites = searchResults.filter((bank) => bank.favourite);
    setSearchResults(favourites);
    setCurrentResults(favourites.slice(0, itemsPerPage));
  };

  const alterFavourites = (index, e) => {
    const { checked } = e.target;
    const newBankData = [...bankData];
    newBankData[index].favourite = checked;
    localStorage.setItem("bankData", JSON.stringify(newBankData));
    setBankData(newBankData);

    if (viewFavourite) {
      setFavourites();
    } else {
      setSearchResults(newBankData);
      setCurrentResults(
        newBankData.slice(
          activePageNumber * itemsPerPage - itemsPerPage,
          activePageNumber * itemsPerPage,
        ),
      );
    }
  };

  const showFavourites = (e) => {
    const { checked } = e.target;
    if (checked) {
      setFavourites();
    } else {
      setSearchResults(bankData);
      setCurrentResults(bankData.slice(0, itemsPerPage));
    }
    setViewFavourite(checked);
  };

  const handleItemsPerPageChange = (e) => {
    const { value } = e.target;
    if (value) {
      setItemsPerPage(parseInt(value));
      setCurrentResults(searchResults.slice(0, parseInt(value)));
    }
  };

  const handlePageChange = (pageNumber) => {
    setActivePageNumber(pageNumber);
    setCurrentResults(
      searchResults.slice(
        pageNumber * itemsPerPage - itemsPerPage,
        pageNumber * itemsPerPage,
      ),
    );
  };

  return (
    <div className="App">
      <main>
        <h1
          style={{
            textAlign: "center",
            fontSize: "4rem",
            margin: "3rem 0 1.5rem 0",
          }}>
          Bank Branches
        </h1>
        <p>Found {searchResults.length} results</p>
        <div id="search-options">
          <select
            name="city"
            id="dropdown"
            value={dropdownOption}
            onChange={(e) => handleDropdownChange(e)}>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
            <option value="bangalore">Banglore</option>
            <option value="chennai">Chennai</option>
            <option value="kolkata">Kolkata</option>
          </select>

          <input
            id="search-bar"
            type="text"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => handleTextChange(e)}
          />

          <input
            id="items-per-page"
            type="number"
            min="1"
            placeholder="Items per page"
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(e)}
          />

          <div id="show-favourites">
            <input type="checkbox" onChange={(e) => showFavourites(e)} />
            <label>View Favourites</label>
          </div>
        </div>

        {loading ? (
          <h2>Loading...</h2>
        ) : (
          <div id="table-container">
            <table>
              <thead>
                <tr>
                  <th>IFSC</th>
                  <th>Bank Id</th>
                  <th>Branch</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>District</th>
                  <th>State</th>
                  <th>Bank Name</th>
                  <th>Favourite</th>
                </tr>
              </thead>
              <tbody>
                {currentResults.map((data, index) => {
                  return (
                    <tr key={index}>
                      {Object.keys(data).map((key, idx) => {
                        if (key === "favourite")
                          return (
                            <td key={idx}>
                              <input
                                className="favourite-checkbox"
                                type="checkbox"
                                style={{ cursor: "pointer" }}
                                checked={
                                  bankData[getIndex(bankData, data)][key]
                                }
                                onChange={(e) =>
                                  alterFavourites(getIndex(bankData, data), e)
                                }
                              />
                            </td>
                          );
                        else return <td key={idx}>{data[key]}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div id="pagination-container">
          <Pagination
            activePage={activePageNumber}
            itemsCountPerPage={itemsPerPage}
            totalItemsCount={searchResults.length}
            onChange={handlePageChange}
            pageRangeDisplayed={8}
          />
        </div>
      </main>
    </div>
  );
}

export default App;

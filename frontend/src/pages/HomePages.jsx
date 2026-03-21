import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLink,
  faVideo,
  faPlus,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";

const HomePages = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">

      <div className="card w-full max-w-4xl bg-base-100 shadow-xl border border-base-300">
        <div className="card-body items-center text-center">

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-semibold">
            Video calls and meetings for everyone
          </h1>

          <p className="text-base-content/70 mt-2 mb-8">
            Connect, collaborate and celebrate from anywhere
          </p>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4 w-full justify-center">

            {/* Dropdown */}
            <div className="dropdown">
              <label tabIndex={0} className="btn btn-primary gap-2">
                <FontAwesomeIcon icon={faVideo} />
                New meeting
              </label>

              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-[1] w-64 p-2 shadow"
              >
                <li>
                  <a>
                    <FontAwesomeIcon icon={faLink} />
                    Create link
                  </a>
                </li>

                <li>
                  <a>
                    <FontAwesomeIcon icon={faPlus} />
                    Start instant meeting
                  </a>
                </li>

                <li>
                  <a>
                    <FontAwesomeIcon icon={faCalendar} />
                    Schedule in Calendar
                  </a>
                </li>
              </ul>
            </div>

            {/* Join Section */}
            <div className="flex w-full md:w-auto gap-2">

              <input
                type="text"
                placeholder="Enter a code or link"
                className="input input-bordered w-full md:w-80"
              />

              <button className="btn btn-outline btn-primary">
                Join
              </button>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default HomePages;

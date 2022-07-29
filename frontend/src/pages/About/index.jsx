import React from "react";
import { useTitle } from "hooks/title";

export const About = () => {
  useTitle("About");
  return (
    <div className="w-1/2 mx-auto text-left my-4">
      <h1 className="text-xl font-semibold">About</h1>
      <br />
      <p>
        This an unofficial Figgie client that has some features that aren&apos;t
        currently supported in the official client such as chat, private rooms
        and promoting/kicking users.
      </p>
      <br />
      <p>
        If you have feedback or new feature suggestions, feel free to reach out
        to us at{" "}
        <a
          className="text-blue-400"
          href="mailto:hello@figgie.app"
          target="_blank"
          rel="noreferrer"
        >
          hello@figgie.app
        </a>
        .
      </p>
      <br />
      <p>
        If you encountered a problem with the site, please contact us at{" "}
        <a
          className="text-blue-400"
          href="mailto:support@figgie.app"
          target="_blank"
          rel="noreferrer"
        >
          support@figgie.app
        </a>
        .
      </p>
      <br />
      <p>
        The official Figgie client from Jane Street is{" "}
        <a
          className="text-blue-400"
          href="https://www.figgie.com"
          target="_blank"
          rel="noreferrer"
        >
          figgie.com
        </a>
        .
      </p>
      <br />
      <p>This site is not affiliated with Jane Street.</p>
    </div>
  );
};

export default About;

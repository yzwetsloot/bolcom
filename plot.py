import json
import os
import sys
import tempfile
from datetime import datetime

import matplotlib.pyplot as plt


temp_dir = tempfile.gettempdir()

task_id = sys.argv[1] # task UUID passed as argument


def date_hook(obj):
    for key, value in obj.items():
        if type(value) == list:
            obj[key] = [
                # process ISO 8601 date strings
                [datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%S.%fZ"), _]
                for (timestamp, _) in value
            ]
    return obj


def tmp_path(filename):
    return os.path.join(temp_dir, filename)


def plot(prices, quantities, file_location):
    # create figure with 2 subplots vertically stacked
    fig, (ax1, ax2) = plt.subplots(2, 1, sharex=True)

    subplot(prices, ax1, fig)
    subplot(quantities, ax2, fig, color="red")

    plt.savefig(file_location, dpi=400)
    plt.clf()


def subplot(data, axis, figure, color="blue"):
    # unzip the data
    timestamps, values = zip(*data)

    axis.plot(timestamps, values, color=color)
    figure.autofmt_xdate()

    if values:
        max_value = max(values)
        axis.set_ylim([0, 1.05 * max_value])

    axis.fill_between(timestamps, values, color=color, alpha=0.1)
    

with open(tmp_path(f"plot_{task_id}.json")) as f:
    data = json.load(f, object_hook=date_hook)

prices = data["prices"]
quantities = data["quantities"]

plot(prices, quantities, tmp_path(f"plot_{task_id}.png"))
